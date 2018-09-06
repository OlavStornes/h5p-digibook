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
    this.element = document.createElement('div');

    
    this.bookpage = H5P.newRunnable(config.Column, contentId, H5P.jQuery(this.element), contentData);
    /**
     * Attach library to wrapper
     *
     * @param {jQuery} $wrapper
     */
    this.attach = function($wrapper) {
      $wrapper.get(0).classList.add('h5p-book-page');
      $wrapper.get(0).appendChild(this.element);
    };
    debugger
  }
}
