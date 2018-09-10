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
    this.columnFinder = function (chapters) {
      let elemArray = [];
      chapters.forEach(c => {
        // debugger;
        c.params.content.forEach(element => {
          elemArray.push(element.content);
        });
      });
      return elemArray;
    };

    //Retrofit the content id to the column content
    this.injectId = function () {
      let tmp = [];
      for (let i = 0; i < this.colelem.length; i++) {
        tmp.push(this.colelem[i].getElementsByClassName('h5p-column-content'));
      }
      
      for (let j = 0; j < tmp.length; j++) {
        for (let i = 0; i < tmp[j].length; i++) {
          tmp[j][i].id = config.chapters[j].params.content[i].content.subContentId;
          
          //Needed to make elements redirectable
          
          tmp[j][i].setAttribute('tabindex', '-1');
        }
      }
    };

    // debugger;
    this.colelem = [];
    for (let i = 0; i < config.chapters.length; i++) {
      this.colelem.push(document.createElement('div'));
      this.bookpage = H5P.newRunnable(config.chapters[i], contentId, H5P.jQuery(this.colelem[i]), contentData);
    }
    this.sidebar = new SideBar(this.columnFinder(config.chapters), contentId);
    this.topbar = new TopBar();

    this.injectId();

    /**
     * Attach library to wrapper
     *
     * @param {jQuery} $wrapper
     */
    this.attach = function ($wrapper) {
      $wrapper.get(0).classList.add('h5p-book-page');
      $wrapper.get(0).appendChild(this.topbar.div);
      $wrapper.get(0).appendChild(this.sidebar.div);

      this.colelem.forEach(element => {
        $wrapper.get(0).appendChild(element);
      });
    };
  }

}

