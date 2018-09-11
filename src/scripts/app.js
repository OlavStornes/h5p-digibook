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
      for (let i = 0; i < chapters.length; i++) {        
        //Index will be used in sorting of the sidebar
        for (let j = 0; j < chapters[i].params.content.length; j++) {
          let input = chapters[i].params.content[j].content;
          // debugger

          input.chapter = i;
          input.section = j;
          elemArray.push(input);
        }
        
      }
      //should return a nested array - elemArray[chapter][section]
      return elemArray;
    };

    //Retrofit the content id to the column content
    this.injectId = function () {
      let tmp = [];
      for (let i = 0; i < this.colelem.length; i++) {
        tmp.push(this.colelem[i].getElementsByClassName('h5p-column-content'));
      }

      /**
       * j - chapters
       * i - sections inside a chapter
       */ 
      for (let j = 0; j < tmp.length; j++) {
        for (let i = 0; i < tmp[j].length; i++) {
          tmp[j][i].id = config.chapters[j].params.content[i].content.subContentId;
          
          //Needed to make elements redirectable
          tmp[j][i].setAttribute('tabindex', '-1');
        }
      }
    };

    this.colelem = [];
    for (let i = 0; i < config.chapters.length; i++) {
      this.colelem.push(document.createElement('div'));
      this.bookpage = H5P.newRunnable(config.chapters[i], contentId, H5P.jQuery(this.colelem[i]), contentData);
      this.colelem[i].id = 'h5p-chapter-' + i;
    }
    this.sidebar = new SideBar(this.columnFinder(config.chapters), contentId);
    this.topbar = new TopBar(contentId, config.chapters.length);

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

