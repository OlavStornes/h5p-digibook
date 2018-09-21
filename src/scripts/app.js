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
    
    //Add all chapters as a separate h5p runnable column 
    this.columnElements = [];
    this.instances = [];
    let tmpInstance = {};
    for (let i = 0; i < config.chapters.length; i++) {
      this.columnElements.push(document.createElement('div'));
      tmpInstance = H5P.newRunnable(config.chapters[i], contentId, H5P.jQuery(this.columnElements[i]), contentData);
      this.columnElements[i].classList.add('h5p-digibook-chapter');
      this.instances.push (tmpInstance);
      //First chapter should be visible.
      //TODO: Make it user spesific?
      if (i != 0) { 
        this.columnElements[i].style.display = 'none';
      }

    }

    this.sideBar = new SideBar(this.columnFinder(config.chapters), contentId, this);
    this.statusBar = new StatusBar(contentId, config.chapters.length, this);


    this.content = document.createElement('div');
    this.content.classList.add('h5p-digibook-content');
    this.content.appendChild(this.sideBar.div);
    
    this.columnElements.forEach(element => {
      this.content.appendChild(element);
    });


    this.statusBar.trigger('updateStatusBar');    

    // Establish all triggers
    this.on('toggleMenu', () => {
      this.sideBar.div.classList.toggle('h5p-digibook-hide');

      setTimeout(function () {
        self.trigger('resize');
      }, 500);
    });

    this.on('scrollToTop', () => {
      this.statusBar.top.scrollIntoView(true);
    });
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
      this.statusBar.trigger('updateStatusBar');
    });
    /**
     * Attach library to wrapper
     *
     * @param {jQuery} $wrapper
     */
    this.attach = function ($wrapper) {
      $wrapper[0].classList.add('h5p-digibook');
      $wrapper.get(0).appendChild(this.statusBar.top);
      $wrapper.get(0).appendChild(this.content);
      $wrapper.get(0).appendChild(this.statusBar.bot);
    };
  }
}


