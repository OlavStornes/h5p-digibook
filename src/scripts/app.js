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

    /**
     * Retrofit the content id to the column element 
     */
    this.injectId = function () {
      let tmp = [];
      for (let i = 0; i < this.colelem.length; i++) {
        tmp.push(this.colelem[i].getElementsByClassName('h5p-column-content'));
      }

      /**
       * j - chapters
       * i - sections inside a chapter
       */
      for (let j = 0; j < tmp.length; j++) {
        for (let i = 0; i < tmp[j].length; i++) {
          tmp[j][i].id = config.chapters[j].params.content[i].content.subContentId;

          //Needed to make elements redirectable
          tmp[j][i].setAttribute('tabindex', '-1');
        }
      }
    };
    
    //Create an array of columns
    this.colelem = [];
    for (let i = 0; i < config.chapters.length; i++) {
      this.colelem.push(document.createElement('div'));
      this.bookpage = H5P.newRunnable(config.chapters[i], contentId, H5P.jQuery(this.colelem[i]), contentData);
      this.colelem[i].id = 'h5p-chapter-' + i;
      //First chapter should be visible.
      //TODO: Make it user spesific?
      if (i != 0){
        this.colelem[i].style.display = 'none';
      }
    }


    this.sidebar = new SideBar(this.columnFinder(config.chapters), contentId);
    this.sidebar.on('newChapter', (chapter) => {
      let newSection = self.colelem[chapter.data];
      
      if (newSection.style.display === 'none'){  
        self.colelem[self.activeChapter].style.display = 'none';
        newSection.style.display = 'block';
      }
      self.activeChapter = chapter.data;
      
      self.trigger('resize');
      
      // Workaround on focusing on new element
      setTimeout(function(){
        newSection.scrollIntoView();
      }, 0);
      
    });
    this.topbar = new TopBar(contentId, config.chapters.length);

    this.injectId();
    /**
     * Attach library to wrapper
     *
     * @param {jQuery} $wrapper
     */
    this.attach = function ($wrapper) {
      $wrapper.get(0).classList.add('h5p-book-page');
      $wrapper.get(0).appendChild(this.topbar.div);
      $wrapper.get(0).appendChild(this.sidebar.div);

      this.colelem.forEach(element => {
        $wrapper.get(0).appendChild(element);
      });
    };
  }
}


