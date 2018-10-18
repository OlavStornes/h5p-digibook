/**
 * The introduction module
 * Constructor function.
 */
class Cover extends H5P.EventDispatcher {
  constructor(coverParam, titleText, readText, contentId, parent) {
    super();

    this.parent = parent;

    this.div = this.createParentElement();

    this.visuals = this.createVisualsElement(coverParam.coverImage, contentId);
    this.title = this.parseTitle(titleText);
    this.description = this.parseDescription(coverParam.coverDescription);
    this.author = 'temp';

    this.button = this.createReadButton(readText);

    this.div.appendChild(this.visuals);
    this.div.appendChild(this.title);
    this.div.appendChild(this.description);
    this.div.appendChild(this.button);
  } 

  /**
   * Create an element which contains both the cover image and a background bar
   * 
   * @param {string} coverImage - A relative path to an image 
   * @param {number} contentId
   */
  createVisualsElement(coverImage, contentId) {

    const div = document.createElement('div');
    div.classList.add('h5p-digibook-cover-graphics');
    const visuals = this.parseImage(coverImage.path, contentId);
    const backBorder = this.createBackBorder();

    div.appendChild(visuals);
    div.appendChild(backBorder);

    return div;
  }

  /**
   * Create an element responsible for the bar behind an image
   */
  createBackBorder() {
    const div = document.createElement('div');
    div.classList.add('h5p-digibook-cover-bar');

    return div;

  }

  /**
   * Create the top level element
   */
  createParentElement() {
    const div = document.createElement('div');
    div.classList.add('h5p-digibook-cover');
    return div;
  }

  /**
   * Create a button-element
   * 
   * @param {string} input - Button-text  
   */
  createReadButton(input) {
    const buttonElem = document.createElement('div');
    buttonElem.classList.add('h5p-digibook-cover-readbutton');
    const button = document.createElement('button');
    button.innerHTML = input;

    button.onclick = () => {
      this.removeCover();
    };


    buttonElem.appendChild(button);
    return buttonElem;
  }

  /**
   * 
   * @param {string} path - relative image path   
   * @param {Number} id - Content id 
   */
  parseImage(path, id) {
    const img = document.createElement('img');
    img.classList.add('h5p-digibook-cover-image');
    img.src = H5P.getPath(path, id);
    img.setAttribute('draggable', 'false');
    img.setAttribute('tabindex', 0);

    return img;
  }

  removeCover() {
    this.div.remove();
  }
  /** 
   * @param {String} input - Text that will go inside the title-element
   */
  parseTitle(input) {
    const titleElem = document.createElement('div');
    titleElem.classList.add('h5p-digibook-cover-title');
    const title = document.createElement('p');
    title.innerHTML = input;

    titleElem.appendChild(title);

    return titleElem;
  }

  /**
   * 
   * @param {String} input - Text that will go inside the description-element 
   */
  parseDescription(input) {
    const descElem = document.createElement('div');
    descElem.classList.add('h5p-digibook-cover-description');
    const desc = document.createElement('p');
    desc.innerHTML = input;

    descElem.appendChild(desc);

    return descElem;
  }
}

export default Cover;