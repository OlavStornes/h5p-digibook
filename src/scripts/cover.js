/**
 * The introduction module
 * Constructor function.
 */
class Cover extends H5P.EventDispatcher {
  constructor(coverParam, title, contentId, contentData, parent) {
    super();

    this.parent = parent;

    this.div = document.createElement('div');

    this.image = this.parseImage(coverParam.coverImage, contentId);
    this.title = this.parseTitle(title);
    this.description = this.parseDescription(coverParam.coverDescription);
    this.author = 'temp';

    this.button = this.createReadButton();

    this.div.appendChild(this.image);
    this.div.appendChild(this.title);
    this.div.appendChild(this.description);
    this.div.appendChild(this.button);
  } 

  createReadButton() {
    const buttonElem = document.createElement('div');
    const button = document.createElement('button');
    button.innerHTML = "Oh boi";

    button.onclick = () => {
      this.removeCover();
    };


    buttonElem.appendChild(button);
    return button;
  }

  parseImage(options, id) {
    const imageElem = document.createElement('div');
    const img = document.createElement('img');
    img.classList.add('h5p-digibook-cover-image');
    img.src = H5P.getPath(options.path, id);
    img.setAttribute('draggable', 'false');
    // img.setAttribute('alt', images[0].alt);
    // img.setAttribute('title', images[0].title);
    // img.setAttribute('aria-live', 'polite');
    img.setAttribute('tabindex', 0);

    imageElem.appendChild(img);
    return imageElem;
  }

  removeCover() {
    console.log(this);
    this.div.remove();
  }

  parseTitle(input) {
    const titleElem = document.createElement('div');
    const title = document.createElement('p');
    title.innerHTML = input;

    titleElem.appendChild(title);

    return titleElem;
  }

  parseDescription(input) {
    const descElem = document.createElement('div');
    const desc = document.createElement('p');
    desc.innerHTML = input;

    descElem.appendChild(desc);

    return descElem;
  }
}

export default Cover;