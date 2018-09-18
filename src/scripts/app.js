import SideBar from './sidebar';
import StatusBar from './statusbar';

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
    var self = this;
    this.activeChapter = 0;
    
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
      H5P.newRunnable(config.chapters[i], contentId, H5P.jQuery(this.columnElements[i]), contentData);
      this.columnElements[i].classList.add('h5p-digibook-chapter');
      
      //First chapter should be visible.
      //TODO: Make it user spesific?
      if (i != 0) { 
        this.columnElements[i].style.display = 'none';
      }
    }

    this.sideBar = new SideBar(this.columnFinder(config.chapters), contentId, this);
    this.topBar = new StatusBar(contentId, config.chapters.length, this, 'top');
    this.botBar = new StatusBar(contentId, config.chapters.length, this, 'bot');

    this.on('toggleMenu', () => {
      this.sideBar.div.hidden = !(this.sideBar.div.hidden);
    });


    this.topBar.trigger('updateTopBar');    
    /**
     * Input in event should be: 
     * @param {int} chapter The given chapter that should be opened
     * @param {int} section The given section to redirect
     */
    this.on('newChapter', (event) => {
      let targetChapter = self.columnElements[event.data.chapter];
      let sectionsInChapter = targetChapter.getElementsByClassName('h5p-column-content');
      
      if (targetChapter.style.display === 'none') {  
        self.columnElements[self.activeChapter].style.display = 'none';
        targetChapter.style.display = 'block';
      }
      self.activeChapter = event.data.chapter;
      
      self.trigger('resize');
      // Workaround on focusing on new element
      setTimeout(function () {
        sectionsInChapter[event.data.section].scrollIntoView(true);
      }, 0);
      this.topBar.trigger('updateTopBar');
    });
    /**
     * Attach library to wrapper
     *
     * @param {jQuery} $wrapper
     */
    this.attach = function ($wrapper) {
      $wrapper.get(0).appendChild(this.topBar.div);
      $wrapper.get(0).classList.add('h5p-book-page');
      $wrapper.get(0).appendChild(this.sideBar.div);
      
      this.columnElements.forEach(element => {
        $wrapper.get(0).appendChild(element);
      });
      $wrapper.get(0).appendChild(this.botBar.div);
    };
  }
}


