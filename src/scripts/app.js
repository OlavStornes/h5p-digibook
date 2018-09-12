import SideBar from './sidebar';
import TopBar from './topbar';

export default class DigiBook extends H5P.EventDispatcher {
  /**
   * @constructor
   *
   * @param {object} config
   * @param {string} contentId
   * @param {object} contentData
   */

  constructor(config, contentId, contentData = {}) {
    super();
    this.activeChapter = 0;
    var self = this;

    /**
     * Converts a list of chapters and splits it up to its respective sections
     * @param {Column[]} chapters - A list of columns 
     * @returns an array of all the sections
     */
    this.columnFinder = function (chapters) {
      let sections = [];
      for (let i = 0; i < chapters.length; i++) {
        //Index will be used in sorting of the sidebar
        for (let j = 0; j < chapters[i].params.content.length; j++) {
          let input = chapters[i].params.content[j].content;

          input.chapter = i;
          input.section = j;
          sections.push(input);
        }
        
      }
      return sections;
    };


    //Add all chapters as a h5p runnable 
    this.columnElements = [];
    for (let i = 0; i < config.chapters.length; i++) {
      this.columnElements.push(document.createElement('div'));
      this.bookpage = H5P.newRunnable(config.chapters[i], contentId, H5P.jQuery(this.columnElements[i]), contentData);
      this.columnElements[i].id = 'h5p-chapter-' + i;

      //Add ID to each content type within a column
      var x = this.columnElements[i].getElementsByClassName('h5p-column-content');
      for (let j = 0; j < x.length; j++) {
        x[j].id = config.chapters[i].params.content[j].content.subContentId; 
      } 

      //First chapter should be visible.
      //TODO: Make it user spesific?
      if (i != 0) { 
        this.columnElements[i].style.display = 'none';
      }
    }


    this.sidebar = new SideBar(this.columnFinder(config.chapters), contentId);
    this.topbar = new TopBar(contentId, config.chapters.length, this);
    
    this.topbar.on('navigate', (event) => {
      debugger;
    });
    this.sidebar.on('newChapter', (event) => {
      let newSection = self.columnElements[event.data.chapter];
      
      if (newSection.style.display === 'none') {  
        self.columnElements[self.activeChapter].style.display = 'none';
        newSection.style.display = 'block';
      }
      self.activeChapter = event.data.chapter;
      
      self.trigger('resize');
      // Workaround on focusing on new element
      setTimeout(function () {
        document.getElementById(event.data.subContentId).scrollIntoView(true);
      }, 0);
      this.trigger('updateChapter');
    });
    /**
     * Attach library to wrapper
     *
     * @param {jQuery} $wrapper
     */
    this.attach = function ($wrapper) {
      $wrapper.get(0).classList.add('h5p-book-page');
      $wrapper.get(0).appendChild(this.topbar.div);
      $wrapper.get(0).appendChild(this.sidebar.div);

      this.columnElements.forEach(element => {
        $wrapper.get(0).appendChild(element);
      });
    };
  }
}


