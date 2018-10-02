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
    const self = this;
    this.activeChapter = 0;
    this.newHandler = {};

    // H5P-instances (columns)
    this.instances = [];
    // Div-elements of the abovementioned h5p-instances
    this.columnElements = [];

    //Go through all columns and initialise them
    for (let i = 0; i < config.chapters.length; i++) {
      const newColumn = document.createElement('div');
      const newInstance = H5P.newRunnable(config.chapters[i].chapter, contentId, H5P.jQuery(newColumn), contentData);
      newColumn.classList.add('h5p-digibook-chapter');
      newInstance.title = config.chapters[i].chapter_title;
      //First chapter should be visible.
      //TODO: Make it user spesific?
      if (i != 0) {
        newColumn.style.display = 'none';
      }

      //Register both the HTML-element and the H5P-element
      this.instances.push (newInstance);
      this.columnElements.push(newColumn);

    }

    this.sideBar = new SideBar(config, contentId, this);
    this.statusBar = new StatusBar(contentId, config.chapters.length, this);

    //Kickstart the statusbar
    this.statusBar.updateStatusBar();

    // Establish all triggers

    this.on('toggleMenu', () => {
      this.sideBar.div.classList.toggle('h5p-digibook-hide');

      //The transition time is set in CSS at 0.5 seconds
      setTimeout(function () {
        self.trigger('resize');
      }, 500);
    });

    this.on('scrollToTop', () => {
      this.sideBar.div.scrollIntoView(true);
    });

    /**
     * Allow for external redirects via GET parameters
     * @param {int} h5pbookid identifier of which book in question
     * @param {int} chapter Chapter which should be redirected to
     * @param {int} section Which section in the abovementioned chapter
     * @example exampleurl/#h5pbookid=X&chapter=Y&section=Z
     */
    document.addEventListener('readystatechange', event => {
      if (event.target.readyState === "complete") {
        const rawparams = top.location.hash.replace('#', "").split('&').map(el => el.split("="));
        const redirObj = {};

        
        //Split up the hash parametres and assign to an object
        rawparams.forEach(argPair => {
          redirObj[argPair[0]] = argPair[1];
        });
        
        if (redirObj.h5pbookid == self.contentId) {
          if (redirObj.chapter && redirObj.section) {
            
            //asssert that the redirect parameters is two good bois 
            if (isNaN(redirObj.section)) {
              redirObj.section = 0;
            }
            if (isNaN(redirObj.chapter)) {
              return;
            }
            this.newChapter(redirObj);
          }
        }
      }
    });

    this.on('newChapter', (event) => {
      this.newHandler = event.data;
      this.newHandler.redirectFromComponent = true;
      const idString = 'h5pbookid=' + this.newHandler.h5pbookid;
      const chapterString = 'chapter=' + this.newHandler.chapter;
      const sectionString = 'section=' + this.newHandler.section;
      event.data.newHash = "#" + idString + "&" + chapterString + "&" + sectionString;
      H5P.communicator.send("changeURL", event.data);
    });

    top.onhashchange = function (event) {

      //If true, we already have information regarding redirect in newHandler
      //When using browser history, a convert is neccecary
      if (self.newHandler.redirectFromComponent == false) {
        const hash = new URL(event.newURL).hash.replace("#", "").split("&")
          .map( el => el.split("="));
        hash.forEach(el => {
          const key = el[0];
          const value = el[1];
          self.newHandler[key] = value;
        });
      }
      
      self.newChapter();
    };

    /**
     * Updates the hash in URL
     * @param {object} newUrl An object with three parametres as shown below
     * ! Has only been tested in a local enviroment
     */
    this.updateHash = function (newUrl) {
      const idString = 'h5pbookid' + newUrl.h5pbookid;
      const chapterString = 'chapter' + newUrl.chapter;
      const sectionString = 'section' + newUrl.section;
      return "#" + idString + "&" + chapterString + "&" + sectionString;
    };
    
    /**
     * Input in targetPage should be: 
     * @param {int} chapter - The given chapter that should be opened
     * @param {int} section - The given section to redirect
     */
    this.newChapter = function () {
      const targetPage = this.newHandler;
      //TODO: Check if the chapters and sections actually exists
      if (targetPage.chapter < self.columnElements.length) {
        const targetChapter = self.columnElements[targetPage.chapter];
        const sectionsInChapter = targetChapter.getElementsByClassName('h5p-column-content');

        if (targetChapter.style.display === 'none') {
          self.columnElements[self.activeChapter].style.display = 'none';
          targetChapter.style.display = 'block';

          //If the content is short, hide the footer
          if (targetChapter.clientHeight <= window.outerHeight) {
            this.statusBar.bot.hidden = true;
          }
          else {
            this.statusBar.bot.hidden = false;
          }
        }
        self.activeChapter = parseInt(targetPage.chapter);

        self.trigger('resize');
        //Avoid accidentaly referring to a section that does not exist
        if (targetPage.section < sectionsInChapter.length) { 
          // Workaround on focusing on new element
          setTimeout(function () {
            sectionsInChapter[targetPage.section].scrollIntoView(true);
          }, 0);
          this.statusBar.updateStatusBar();
          targetPage.redirectFromComponent = false;

        }
      }
    };
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

      const content = document.createElement('div');
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


