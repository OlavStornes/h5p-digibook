import SideBar from './sidebar';
import StatusBar from './statusbar';
import Cover from './cover';
import PageContent from './pagecontent';

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
    this.behaviour = config.behaviour;
    this.animationInProgress = false;

    // H5P-instances (columns)
    this.instances = [];

    this.getActiveChapter = () => {
      return this.activeChapter;
    };

    this.retrieveHashFromUrl = () => {
      const rawparams = top.location.hash.replace('#', "").split('&').map(el => el.split("="));
      const redirObj = {};

      //Split up the hash parametres and assign to an object
      rawparams.forEach(argPair => {
        redirObj[argPair[0]] = argPair[1];
      });

      if (redirObj.h5pbookid == self.contentId && redirObj.chapter) {
        //Parameter sanitization
        if (isNaN(redirObj.chapter && parseInt(redirObj.chapter) > 0)) {
          return;
        }
        else {
          // Fix off by one to support native arrays
          redirObj.chapter = parseInt(redirObj.chapter) - 1;
        }
        if (isNaN(redirObj.section && redirObj.section > 0)) {
          delete redirObj.section;
        }
      }
      return redirObj;
    };

    this.setActiveChapter = (input) => {
      const number = parseInt(input);
      if (!isNaN(number)) {
        this.activeChapter = parseInt(input);
      }
    };

    //Initialize the support components
    if (config.showCoverPage) {
      this.cover = new Cover(config.bookCover, contentData.metadata.title, config.read, contentId, this);
    }

    this.pageContent = new PageContent(config, contentId, contentData, this);
    this.sideBar = new SideBar(config, contentId, contentData.metadata.title, this);
    this.statusBar = new StatusBar(contentId, config.chapters.length, this, {
      l10n: {
        nextPage: config.nextPage,
        previousPage: config.previousPage,
        navigateToTop: config.navigateToTop
      },
      behaviour: this.behaviour
    });

    /**
     * Establish all triggers
     */
    this.on('toggleMenu', () => {
      this.sideBar.div.classList.toggle('h5p-digibook-hide');

      //The transition time is set in CSS at 0.5 seconds
      setTimeout(() => {
        this.trigger('resize');
      }, 500);
    });

    this.on('scrollToTop', () => {
      this.statusBar.header.scrollIntoView(true);
    });


    /**
     * Compare the current hash with the currently redirected hash.
     * 
     * Used for checking if the user attempts to redirect to the same section twice
     * @param {object} hashObj - the object that should be compared to the hash
     * @param {number} hashObj.chapter
     * @param {number} hashObj.section
     * @param {number} hashObj.h5pbookid
     */
    this.isCurrentHashSameAsRedirect = (hashObj) => {
      const temp = this.retrieveHashFromUrl();

      for (const key in temp) {
        if (temp.hasOwnProperty(key)) {
          const element = parseInt(temp[key]);
          if (element !== hashObj[key]) {
            return false;
          }

        }
      }
      return true;
    };


    /**
     * 
     */
    this.on('newChapter', (event) => {
      if (this.animationInProgress) {
        return;
      }

      this.newHandler = event.data;

      //Assert that the module itself is asking for a redirect
      this.newHandler.redirectFromComponent = true;

      // Create the new hash
      const idString = 'h5pbookid=' + this.newHandler.h5pbookid;
      const chapterString = '&chapter=' + (this.newHandler.chapter + 1);
      let sectionString = "";
      if (this.newHandler.section !== undefined) {
        sectionString = '&section=' + this.newHandler.section;
      }
      event.data.newHash = "#" + idString + chapterString + sectionString;

      if (event.data.chapter === this.activeChapter) {

        if (this.isCurrentHashSameAsRedirect(event.data)) {
          //only trigger section redirect without changing hash
          this.pageContent.changeChapter(false, event.data);
          return;
        }
      }
      H5P.trigger(this, "changeHash", event.data);
    });

    H5P.externalDispatcher.on('xAPI', function (event) {
      if (event.getVerb() === 'answered') {
        if (self.behaviour.progressIndicators) {
          self.setSectionStatusByID(this.contentData.subContentId, self.activeChapter);
        }
      }
    });


    /**
     * Check if the current chapter is read
     * 
     * @returns {boolean}
     */
    this.isCurrentChapterRead = () => {
      return this.instances[this.activeChapter].completed;
    };

    /**
     * Set the current chapter as completed
     */
    this.setCurrentChapterRead = () => {
      this.instances[this.activeChapter].completed = true;
      this.sideBar.setChapterIndicatorComplete(this.activeChapter);
    };


    /**
     * Check if the content height exceeds the window
     * @param {div} chapterHeight 
     */
    this.shouldFooterBeVisible = (chapterHeight) => {
      if (this.behaviour.progressAuto) {
        return chapterHeight <= window.outerHeight;
      }
    };

    /**
     * Change the current active chapter
     * @param {boolean} redirectOnLoad - Is this a redirect which happens immediately?
     */
    this.changeChapter = (redirectOnLoad) => {
      this.pageContent.changeChapter(redirectOnLoad, this.newHandler);
      this.statusBar.updateStatusBar();
      this.newHandler.redirectFromComponent = false;
    };

    /**
     * Attach library to wrapper
     * @param {jQuery} $wrapper
     */
    this.attach = function ($wrapper) {

      $wrapper[0].classList.add('h5p-scrollable-fullscreen');
      // Needed to enable scrolling in fullscreen
      $wrapper[0].id = "h5p-digibook";
      if (this.cover) {
        $wrapper.get(0).appendChild(this.cover.div);
      }
      $wrapper.get(0).appendChild(this.statusBar.header);
      this.pageContent.div.prepend(this.sideBar.div);


      $wrapper.get(0).appendChild(this.pageContent.div);
      $wrapper.get(0).appendChild(this.statusBar.footer);
    };

    /**
     * Allow for external redirects via hash parameters
     * @param {int} h5pbookid identifier of which book in question
     * @param {int} chapter Chapter which should be redirected to
     * @param {int} section Which section in the abovementioned chapter
     * @example exampleurl/#h5pbookid=X&chapter=Y&section=Z
     */
    document.addEventListener('readystatechange', event => {
      if (event.target.readyState === "complete") {
        this.newHandler = this.retrieveHashFromUrl();
        this.changeChapter(true);
      }
    });

    /**
     * Triggers whenever the hash changes, indicating that a chapter redirect is happening
     */
    H5P.on(this, 'respondChangeHash', function (event) {
      if (event.data.newURL.indexOf('h5pbookid' !== -1)) {
        const payload = {
          newHash: new URL(event.data.newURL).hash,
          context: 'h5p'
        };
        this.redirectChapter(payload);
      }
    });


    this.redirectChapter = function (event) {
      /**
       * If true, we already have information regarding redirect in newHandler
       * When using browser history, a convert is neccecary
       */
      if (!this.newHandler.redirectFromComponent) {
        let tmpEvent;
        tmpEvent = event;

        //Only attempt converting if there is actually a hash present
        if (tmpEvent.context === 'h5p') {
          const hash = tmpEvent.newHash;
          if (hash) {
            const hashArray = hash.replace("#", "").split("&").map(el => el.split("="));
            const tempHandler = {};
            hashArray.forEach(el => {
              const key = el[0];
              const value = el[1];
              tempHandler[key] = value;
            });

            // Assert that the handler actually is from this content type. 
            if (tempHandler.h5pbookid == self.contentId && tempHandler.chapter) {
              //Fix off by one-errors
              tempHandler.chapter = parseInt(tempHandler.chapter) - 1;
              self.newHandler = tempHandler;
            }
          }
          /** 
           * H5p-context switch on no newhash = history backwards
           * Redirect to first chapter 
           */
          else {
            self.newHandler = {
              chapter: 0,
              h5pbookid: self.h5pbookid
            };
          }
        }
        else {
          return;
        }
      }
      self.changeChapter(false);
    };



    H5P.on(this, 'changeHash', function (event) {
      if (event.data.h5pbookid === this.contentId) {
        top.location.hash = event.data.newHash;
        location.hash = event.data.newHash;
      }
    });
    //Kickstart the statusbar
    this.statusBar.updateStatusBar();


    /**
     * Update statistics on the main chapter
     * 
     * @param {number} targetChapter 
     */
    this.updateChapterProgress = function (targetChapter) {
      if (!this.behaviour.progressIndicators || !this.behaviour.progressAuto) {
        return;
      }
      const chapter = this.instances[targetChapter];
      let status;

      if (chapter.maxTasks) {
        if (chapter.tasksLeft === chapter.maxTasks) {
          status = 'BLANK';
        }
        else if (chapter.tasksLeft === 0) {
          status = 'DONE';
        }
        else {
          status = 'STARTED';
        }
      }

      else {
        status = 'DONE';
      }

      if (status === 'DONE') {
        chapter.triggerXAPIScored(chapter.getScore(), chapter.getMaxScore(), 'completed');
      }
      this.sideBar.updateChapterProgressIndicator(targetChapter, status);
    };

    /**
     * Set a section progress indicator
     * 
     * @param {string} targetId 
     * @param {string} targetChapter 
     */
    this.setSectionStatusByID = function (targetId, targetChapter) {
      for (let i = 0; i < this.instances[targetChapter].childInstances.length; i++) {
        const element = this.instances[targetChapter].childInstances[i];
        if (element.subContentId === targetId && !element.taskDone) {
          element.taskDone = true;

          this.sideBar.setSectionMarker(targetChapter, i);



          this.instances[targetChapter].tasksLeft -= 1;
          if (this.behaviour.progressAuto) {
            this.updateChapterProgress(targetChapter);
          }
        }
      }
    };

    window.addEventListener('hashchange', (event) => {
      H5P.trigger(this, 'respondChangeHash', event);
    });
  }

}