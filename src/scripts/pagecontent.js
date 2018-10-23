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


}

export default PageContent;