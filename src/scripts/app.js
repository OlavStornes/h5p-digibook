import NavBar from './navbar';

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

      let navigation = '';
      for (let i = 0; i < elemArray.length; i++) {
        navigation += "- " + elemArray[i].library.split(' ')[0] + '<br>';
      }
      return navigation;
    };
    

    this.colelem = document.createElement('div');

    this.bookpage = H5P.newRunnable(config.Column, contentId, H5P.jQuery(this.colelem), contentData);
    this.navbar = new NavBar(this.columnFinder(config.Column.params.content), contentId);

    
    /**
     * Attach library to wrapper
     *
     * @param {jQuery} $wrapper
     */
    this.attach = function($wrapper) {
      $wrapper.get(0).classList.add('h5p-book-page');
      $wrapper.get(0).appendChild(this.colelem);
      $wrapper.get(0).appendChild(this.navbar.div);

    };
  }
}


  