class PageContent extends H5P.EventDispatcher {
  /**
   * @constructor
   *
   * @param {object} config
   * @param {string} contentId
   * @param {object} contentData
   */
  constructor(config, contentId, contentData = {}) {
    super();
    this.parent = parent;
    this.behaviour = config.behaviour;

    // H5P-instances (columns)
    this.instances = [];
    // Div-elements of the abovementioned h5p-instances
    this.columnElements = [];

    this.createColumns(config, contentId, contentData);

    this.div = this.createPageContent();
  }

  createPageContent() {
    const main = document.createElement('div');
    const content = document.createElement('div');
    content.classList.add('h5p-digibook-content');
    main.classList.add('h5p-digibook-main');
    this.columnElements.forEach(element => {
      content.appendChild(element);
    });
    main.appendChild(content);
    return main;
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


  redirectSection(targetPage, sectionsInChapter) {
    if (targetPage.section < sectionsInChapter.length) {
      sectionsInChapter[targetPage.section].scrollIntoView(true);
      targetPage.redirectFromComponent = false;
    }
  }

  /**
   * Input in targetPage should be: 
   * @param {int} chapter - The given chapter that should be opened
   * @param {int} section - The given section to redirect
   */
  changeChapter(redirectOnLoad) {
    if (this.animationInProgress) {
      return;
    }

    const targetPage = this.newHandler;
    const oldChapterNum = this.activeChapter;



    if (targetPage.chapter < this.columnElements.length) {
      const oldChapter = this.columnElements[oldChapterNum];
      const targetChapter = this.columnElements[targetPage.chapter];
      const sectionsInChapter = targetChapter.getElementsByClassName('h5p-column-content');

      this.activeChapter = parseInt(targetPage.chapter);
      this.statusBar.updateStatusBar();

      if (oldChapterNum !== this.activeChapter) {
        this.animationInProgress = true;


        var newPageProgress = '';
        var oldPageProgrss = '';
        // The pages will progress from right to left
        if (oldChapterNum < targetPage.chapter) {
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
        
        self.animationInProgress = false;
        targetChapter.addEventListener('transitionend', function _animationCallBack(event) {
          if (event.propertyName === 'transform') {
            // Remove all animation-related classes
            targetChapter.classList.remove('h5p-digibook-offset-right', 'h5p-digibook-offset-left', 'h5p-digibook-animate-new');
            oldChapter.classList.remove('h5p-digibook-offset-right', 'h5p-digibook-offset-left');
            oldChapter.classList.add('h5p-content-hidden');
          
            self.trigger('resize');

            let footerStatus = self.shouldFooterBeVisible(targetChapter.clientHeight);
            self.statusBar.editFooterVisibillity(footerStatus);

            //Focus on section only after the page scrolling is finished
            self.redirectSection(targetPage, sectionsInChapter);
          }
          //Avoid duplicate event listeners
          targetChapter.removeEventListener('transitionend', _animationCallBack);
        });
        
        // Play the animation
        setTimeout(() => {
          oldChapter.classList.add('h5p-digibook-offset-' + oldPageProgrss);
          targetChapter.classList.remove('h5p-digibook-offset-' + newPageProgress);
        }, 20);
        

      }

      else {
        this.redirectSection(targetPage, sectionsInChapter);
      }

      this.sideBar.redirectHandler(targetPage.chapter);
      if (!redirectOnLoad) {
        this.sideBar.updateChapterTitleIndicator(oldChapterNum);
      }
    }
  }


}

export default PageContent;