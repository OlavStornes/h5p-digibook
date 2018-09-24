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
    
    
    //Add all chapters as a separate h5p runnable column 
    this.columnElements = [];
    this.instances = [];
    let tmpInstance = {};
    for (let i = 0; i < config.chapters.length; i++) {
      this.columnElements.push(document.createElement('div'));
      tmpInstance = H5P.newRunnable(config.chapters[i].chapter, contentId, H5P.jQuery(this.columnElements[i]), contentData);
      this.columnElements[i].classList.add('h5p-digibook-chapter');
      this.instances.push (tmpInstance);
      //First chapter should be visible.
      //TODO: Make it user spesific?
      if (i != 0) { 
        this.columnElements[i].style.display = 'none';
      }

    }

    this.sideBar = new SideBar(config, contentId, this);
    this.statusBar = new StatusBar(contentId, config.chapters.length, this);

    this.statusBar.trigger('updateStatusBar');    

    // Establish all triggers
    this.on('toggleMenu', () => {
      this.sideBar.div.classList.toggle('h5p-digibook-hide');

      setTimeout(function () {
        self.trigger('resize');
      }, 500);
    });

    this.on('scrollToTop', () => {
      this.sideBar.div.scrollIntoView(true);
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
      $wrapper[0].classList.add('h5p-scrollable-fullscreen');
      // Needed to enable scrolling in fullscreen
      $wrapper[0].id = "h5p-digibook";
      $wrapper.get(0).appendChild(this.statusBar.top);

      let content = document.createElement('div');
      content.classList.add('h5p-digibook-content');
      content.appendChild(this.sideBar.div);
      this.columnElements.forEach(element => {
        content.appendChild(element);
      });

      $wrapper.get(0).appendChild(content);
      $wrapper.get(0).appendChild(this.statusBar.bot);
    };
  }
}


