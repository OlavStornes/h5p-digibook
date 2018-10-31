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
    this.contentId = contentId;
    this.activeChapter = 0;
    this.newHandler = {};
    this.behaviour = config.behaviour;
    this.animationInProgress = false;

    // H5P-instances (columns)
    this.instances = [];

    this.getActiveChapter = () => {
      return this.activeChapter;
    };

    this.setActiveChapter = (input) => {
      const number = parseInt(input);
      if (!isNaN(number)) {
        this.activeChapter = parseInt(input);
      }
    };

    this.retrieveHashFromUrl = () => {
      const rawparams = top.location.hash.replace('#', "").split('&').map(el => el.split("="));
      const redirObj = {};

      //Split up the hash parametres and assign to an object
      rawparams.forEach(argPair => {
        redirObj[argPair[0]] = argPair[1];
      });

      if (redirObj.h5pbookid == self.contentId && redirObj.chapter) {
        if (!redirObj.chapter) {
          return;
        }
      }
      return redirObj;
    };

    /**
     * Compare the current hash with the currently redirected hash.
     * 
     * Used for checking if the user attempts to redirect to the same section twice
     * @param {object} hashObj - the object that should be compared to the hash
     * @param {String} hashObj.chapter
     * @param {String} hashObj.section
     * @param {number} hashObj.h5pbookid
     */
    this.isCurrentHashSameAsRedirect = (hashObj) => {
      const temp = this.retrieveHashFromUrl();
      for (const key in temp) {
        if (temp.hasOwnProperty(key)) {
          const element = temp[key];
          if (element != hashObj[key]) {
            return false;
          }
        }
      }
      return true;
    };

    /**
     * Establish all triggers
     */
    this.on('toggleMenu', () => {
      this.sideBar.div.classList.toggle('h5p-digibook-hide');
    });

    this.on('scrollToTop', () => {
      this.statusBar.header.scrollIntoView(true);
    });

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
      const chapterString = '&chapter=' + this.newHandler.chapter;
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
     * Check if the content height exceeds the window
     * @param {div} chapterHeight 
     */
    this.shouldFooterBeVisible = (chapterHeight) => {
      if (this.behaviour.progressAuto) {
        return chapterHeight <= window.outerHeight;
      }
    };

    /**
     * Resize all child instances. 
     */
    this.resizeChildInstances = function () {
      this.instances[this.activeChapter].childInstances.forEach(x => {
        x.trigger('resize');
      });
      this.trigger('resize');
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
     * Triggers whenever the hash changes, indicating that a chapter redirect is happening
     */
    H5P.on(this, 'respondChangeHash', function (event) {
      const payload = self.retrieveHashFromUrl(new URL(event.data.newURL).hash);
      if (payload.h5pbookid) {
        this.redirectChapter(payload);
      }
    });

    H5P.on(this, 'changeHash', function (event) {
      if (event.data.h5pbookid === this.contentId) {
        top.location.hash = event.data.newHash;
      }
    });
    
    H5P.externalDispatcher.on('xAPI', function (event) {
      if (event.getVerb() === 'answered') {
        if (self.behaviour.progressIndicators) {
          self.setSectionStatusByID(this.contentData.subContentId, self.activeChapter);
        }
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
        // Assert that the handler actually is from this content type. 
        if (tmpEvent.h5pbookid && parseInt(tmpEvent.h5pbookid) === self.contentId) {
          self.newHandler = tmpEvent;
        /** 
         * H5p-context switch on no newhash = history backwards
         * Redirect to first chapter 
         */
        }
        else {
          self.newHandler = {
            chapter: self.instances[0].subContentId,
            h5pbookid: self.h5pbookid
          };
        }
      }
      self.changeChapter(false);
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

    top.addEventListener('hashchange', (event) => {
      H5P.trigger(this, 'respondChangeHash', event);
    });

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

    //Initialize the support components
    if (config.showCoverPage) {
      this.cover = new Cover(config.bookCover, contentData.metadata.title, config.read, contentId, this);
    }

    this.pageContent = new PageContent(config, contentId, contentData, this, {
      l10n: {
        markAsFinished: config.markAsFinished
      },
      behaviour: this.behaviour
    });

    this.sideBar = new SideBar(config, contentId, contentData.metadata.title, this);

    this.statusBar = new StatusBar(contentId, config.chapters.length, this, {
      l10n: {
        nextPage: config.nextPage,
        previousPage: config.previousPage,
        navigateToTop: config.navigateToTop
      },
      behaviour: this.behaviour
    });

    //Kickstart the statusbar
    this.statusBar.updateStatusBar();
  }
}