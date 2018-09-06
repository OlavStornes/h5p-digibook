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

    this.bookpage = H5P.newRunnable(config.Column, contentId, H5P.jQuery(this.colelem), contentData);
    this.navbar = new NavBar(config.navbar, contentId);

    
    
    
    //Find all column elements
    // let columnElems = this.columnFinder(config.Column.params.content);
    
    //Edit the accordian text before applying it to a fresh instance
    // let navigation = "";
    // for (let i = 0; i < columnElems.length; i++) {
    //   navigation += "- " + columnElems[i].library.split(' ')[0] + '<br>';
    // }
    
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

/**
   * Constructor function.
   */
class NavBar extends H5P.EventDispatcher {
  constructor(text, contentId) {
    super();
    // Extend defaults with provided options
    this.text = text;
    // Keep provided id.
    this.id = contentId;
    this.div = document.createElement('div');
    var newContent = document.createTextNode(this.text); 
    // add the text node to the newly created div
    this.div.appendChild(newContent);  
  }
}
  