class PageContent extends H5P.EventDispatcher {
  /**
   * @constructor
   *
   * @param {object} config
   * @param {string} contentId
   * @param {object} contentData
   */
  constructor(config, contentId, contentData, parent) {
    super();
    this.parent = parent;
    this.behaviour = config.behaviour;

    // H5P-instances (columns)
    this.instances = [];
    // Div-elements of the abovementioned h5p-instances
    this.columnElements = [];

    this.createColumns(config, contentId, contentData);
    this.parent.instances = this.instances;

    this.div = document.createElement('div');
    this.div.classList.add('h5p-digibook-main');

    this.content = this.createPageContent();
    this.addcontentListener();


    this.div.appendChild(this.content);
  }

  createPageContent() {
    const content = document.createElement('div');
    content.classList.add('h5p-digibook-content');
    this.columnElements.forEach(element => {
      content.appendChild(element);
    });
    return content;
  }

  createColumns(config, contentId, contentData) {
    //Go through all columns and initialise them
    for (let i = 0; i < config.chapters.length; i++) {
      const newColumn = document.createElement('div');
      const newInstance = H5P.newRunnable(config.chapters[i].chapter, contentId, H5P.jQuery(newColumn), contentData);
      newInstance.childInstances = newInstance.getInstances();
      newColumn.classList.add('h5p-digibook-chapter');
      newInstance.title = config.chapters[i].chapter_title;
      newInstance.completed = false;
      

      //Find sections with tasks and tracks them
      newInstance.tasksLeft = 0;
      if (this.behaviour.progressIndicators) {
        newInstance.childInstances.forEach(x => {
          if (this.isH5PTask(x)) {
            x.isTask = true;
            x.taskDone = false;
            newInstance.tasksLeft += 1;
          }
        });
      }
      newInstance.maxTasks = newInstance.tasksLeft;
      
      
      //First chapter should be visible.
      //TODO: Make it user spesific?
      if (i != 0) {
        newColumn.classList.add('h5p-content-hidden');
      }
      //Register both the HTML-element and the H5P-element
      this.instances.push(newInstance);
      this.columnElements.push(newColumn);
    }
    
  }

  isH5PTask(H5PObject) {
    if (typeof H5PObject.getMaxScore === 'function') {
      return H5PObject.getMaxScore() > 0;
    }
    return false;
  }


  redirectSection(chapterElement) {
    const sectionsInChapter = chapterElement.getElementsByClassName('h5p-column-content');
    if (this.targetPage.section < sectionsInChapter.length) {
      sectionsInChapter[this.targetPage.section].scrollIntoView(true);
      this.targetPage.redirectFromComponent = false;
    }
  }

  /**
   * Input in targetPage should be: 
   * @param {int} chapter - The given chapter that should be opened
   * @param {int} section - The given section to redirect
   */
  changeChapter(redirectOnLoad, newHandler) {
    if (this.parent.animationInProgress) {
      return;
    }

    this.targetPage = newHandler;
    const oldChapterNum = this.parent.getActiveChapter();
    const newChapterNum = parseInt(this.targetPage.chapter);


    if (this.targetPage.chapter < this.columnElements.length) {
      const oldChapter = this.columnElements[oldChapterNum];
      const targetChapter = this.columnElements[this.targetPage.chapter];
      
      if (oldChapterNum !== newChapterNum) {
        this.parent.animationInProgress = true;
        this.parent.setActiveChapter(newChapterNum);
        
        
        var newPageProgress = '';
        var oldPageProgrss = '';
        // The pages will progress from right to left
        if (oldChapterNum < this.targetPage.chapter) {
          newPageProgress = 'right';
          oldPageProgrss = 'left';
        }
        else {
          newPageProgress = 'left';
          oldPageProgrss = 'right';
        }
        // Set up the slides
        targetChapter.classList.add('h5p-digibook-animate-new', 'h5p-digibook-offset-' + newPageProgress);
        targetChapter.classList.remove('h5p-content-hidden');
        
        // Play the animation
        setTimeout(() => {
          oldChapter.classList.add('h5p-digibook-offset-' + oldPageProgrss);
          targetChapter.classList.remove('h5p-digibook-offset-' + newPageProgress);
          this.parent.animationInProgress = false;
        }, 50);
      }

      else {
        this.redirectSection(targetChapter);
      }

      this.parent.sideBar.redirectHandler(this.targetPage.chapter);
      if (!redirectOnLoad) {
        this.parent.sideBar.updateChapterTitleIndicator(oldChapterNum);
      }
    }
  }
  addcontentListener() {
    const self = this;
    this.content.addEventListener('transitionend', function _animationCallBack(event) {
      const activeChapter = self.parent.getActiveChapter();
      if (event.propertyName === 'transform' && event.target === self.columnElements[activeChapter]) {
        // Remove all animation-related classes
        const inactiveElems = self.columnElements.filter(x => x !== self.columnElements[activeChapter]);
        inactiveElems.map(x => x.classList.remove('h5p-digibook-offset-right', 'h5p-digibook-offset-left'));
        inactiveElems.map(x => x.classList.add('h5p-content-hidden'));

        const activeElem = self.columnElements[activeChapter];

        activeElem.classList.remove('h5p-digibook-offset-right', 'h5p-digibook-offset-left', 'h5p-digibook-animate-new');
        
        self.trigger('resize');
        
        let footerStatus = self.parent.shouldFooterBeVisible(activeElem.clientHeight);
        self.parent.statusBar.editFooterVisibillity(footerStatus);
        
        //Focus on section only after the page scrolling is finished
        self.redirectSection(activeElem);
      }
    });
  }
}

export default PageContent;