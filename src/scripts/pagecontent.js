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

  }


  isH5PTask(H5PObject) {
    if (typeof H5PObject.getMaxScore === 'function') {
      return H5PObject.getMaxScore() > 0;
    }
    return false;
  }


}

export default PageContent;