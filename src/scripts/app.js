import SideBar from './sidebar';
import TopBar from './topbar';

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
    // Find all types of content inside a column
    this.columnFinder = function(arrElems) {
      let elemArray = [];
      arrElems.forEach(e => {
        elemArray.push(e.content);
      });
      return elemArray;
    };

    //Retrofit the content id to the column content
    this.injectId = function() {
      let tmp = this.colelem.getElementsByClassName('h5p-column-content');
      for (let i = 0; i < tmp.length; i++) {
        tmp[i].id = config.Column.params.content[i].content.subContentId;

        //Needed to make elements redirectable
        tmp[i].setAttribute('tabindex', '-1');
      }
    };
    
    this.colelem = document.createElement('div');
    
    this.bookpage = H5P.newRunnable(config.Column, contentId, H5P.jQuery(this.colelem), contentData);
    this.sidebar = new SideBar(this.columnFinder(config.Column.params.content), contentId);
    this.topbar = new TopBar();

    this.injectId();
    
    /**
     * Attach library to wrapper
     *
     * @param {jQuery} $wrapper
     */
    this.attach = function($wrapper) {
      $wrapper.get(0).classList.add('h5p-book-page');
      $wrapper.get(0).appendChild(this.topbar.div);
      $wrapper.get(0).appendChild(this.sidebar.div);
      $wrapper.get(0).appendChild(this.colelem);

    };
  }

}

