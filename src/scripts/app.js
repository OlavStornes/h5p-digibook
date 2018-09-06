import Navbar from './navbar';

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
    

    this.colelem = document.createElement('div');
    this.navelem = document.createElement('div');
    
    this.bookpage = H5P.newRunnable(config.Column, contentId, H5P.jQuery(this.colelem), contentData);

    this.navbar = new Navbar(config.navbar);
    
    
    
    //Find all column elements
    let columnElems = this.columnFinder(config.Column.params.content);

    // console.log("all the columns:");
    // console.log(columnElems);
    
    //Edit the accordian text before applying it to a fresh instance
    let navigation = "";
    for (let i = 0; i < columnElems.length; i++) {
      navigation += "- " + columnElems[i].library.split(' ')[0] + '<br>';
    }

    // navigation = config.Navbar.params.panels[0].content.params.text.replace('__testsection', navigation);
    // config.Navbar.params.panels[0].content.params.text = navigation;
    
    this.navbar = H5P.newRunnable(config.Navbar, contentId, H5P.jQuery(this.navelem), contentData);
    // debugger;
    
    /**
     * Attach library to wrapper
     *
     * @param {jQuery} $wrapper
     */
    this.attach = function($wrapper) {
      $wrapper.get(0).classList.add('h5p-book-page');
      $wrapper.get(0).appendChild(this.colelem);
      $wrapper.get(0).appendChild(this.navelem);

    };
  }
}
