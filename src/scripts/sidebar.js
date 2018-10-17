/**
 * A component which helps in navigation
 * Constructor function.
 */
class SideBar extends H5P.EventDispatcher {
  constructor(config, contentId, parent) {
    super();
    this.id = contentId;
    this.parent = parent;
    this.behaviour = config.behaviour;
    this.content = document.createElement('div');
    this.div = this.addSideBar();

    this.chapters = this.findAllChapters(parent.instances, config.chapters);
    this.chapterElems = this.getChapterElements();
    
    
    if (config.title) {
      this.titleElem = this.addMainTitle(config.title);
      this.div.appendChild(this.titleElem.div);
    }

    this.chapterElems.forEach(element => {
      this.content.appendChild(element);
    });
    
    this.div.appendChild(this.content);


  }


  addSideBar() {
    const main = document.createElement('div');

    main.classList.add('h5p-digibook-navigation');
    if (!this.behaviour.defaultTableOfContents) {
      main.classList.add('h5p-digibook-hide');
    }

    return main;
  }

  addMainTitle(title) {
    const div = document.createElement('div');
    const p = document.createElement('p');

    div.classList.add('h5p-digibook-navigation-maintitle');

    p.innerHTML = title;
    div.appendChild(p);
    return {
      div,
      p
    };
  }


  findSectionsInChapter(chapter, config) {
    const tmp = [];
    for (let j = 0; j < chapter.childInstances.length; j++) {
      const section = chapter.childInstances[j];
      section.title = this.parseLibrary(config[j].content);
      tmp.push(section);
    }
    return tmp;
  }

  findAllChapters(instances, config) {
    const chapters = [];
    for (let i = 0; i < instances.length; i++) {
      const sections = this.findSectionsInChapter(instances[i], config[i].chapter.params.content);
      const chapterTitle = config[i].chapter_title;
      chapters.push({
        sections,
        title:chapterTitle
      });
    }
    return chapters;
  }


  editChapterStatus(element, closing) {
    if (closing) {
      element.classList.add('h5p-digibook-navigation-closed');
      const arrow = element.getElementsByClassName('icon-expanded')[0];
      if (arrow) {
        arrow.classList.remove('icon-expanded');
        arrow.classList.add('icon-collapsed');
      }
      
    }
    else {
      element.classList.remove('h5p-digibook-navigation-closed');
      const arrow = element.getElementsByClassName('icon-collapsed')[0];
      if (arrow) {
        arrow.classList.remove('icon-collapsed');
        arrow.classList.add('icon-expanded');
      }
    }
  }
  

  //Fires whenever a redirect is happening in parent
  redirectHandler(newChapter) {
    this.chapterElems.filter(x => 
      this.chapterElems.indexOf(x) != newChapter).forEach(x => this.editChapterStatus(x, true));


    const targetElem = this.chapterElems[newChapter];
    this.editChapterStatus(targetElem, false);
  }

  /**
   * Update the indicator on a spesific chapter.
   * 
   * @param {number} targetChapter - The chapter that should be updated
   */
  updateChapterTitleIndicator(targetChapter) {
    if (!this.behaviour.progressIndicators || !this.behaviour.progressAuto) {
      return;
    }
    const x = this.chapters[targetChapter];
    let targetElem = this.chapterElems[targetChapter].getElementsByClassName('h5p-digibook-navigation-chapter-title')[0];
    targetElem = targetElem.getElementsByClassName('h5p-digibook-navigation-chapter-progress')[0];

    if (x.hasTasks) {
      if (x.tasksLeft == x.maxTasks) {
        targetElem.classList.remove('icon-chapter-started', 'icon-chapter-done');
        targetElem.classList.add('icon-chapter-blank');
      }
      else if (x.tasksLeft === 0) {
        targetElem.classList.remove('icon-chapter-blank', 'icon-chapter-started');
        targetElem.classList.add('icon-chapter-done');
      }
      else {
        targetElem.classList.remove('icon-chapter-blank', 'icon-chapter-done');
        targetElem.classList.add('icon-chapter-started');
      }
    }
    else {
      targetElem.classList.remove('icon-chapter-blank');
      targetElem.classList.add('icon-chapter-done');
    }
  }

  setSectionMarker(targetChapter, targetSection) {
    const tmp = this.chapterElems[targetChapter].getElementsByClassName('h5p-digibook-navigation-section')[targetSection];
    const icon = tmp.getElementsByTagName('a')[0];
    if (icon) {
      icon.classList.remove('icon-chapter-blank');
      icon.classList.add('icon-chapter-done');
    }
  }

  toggleChapter(element) {
    const x = element.currentTarget.parentElement;
    const bool = !(x.classList.contains('h5p-digibook-navigation-closed'));
    this.editChapterStatus(x, bool);
  }


  createElemFromChapter(chapter, chapterIndex) {
    const that = this;

    //Initialize elements
    const chapterDiv = document.createElement('div');
    const sectionsDiv = document.createElement('div');
    const titleDiv = document.createElement('div');
    const title = document.createElement('p');

    //Add classes
    titleDiv.classList.add('h5p-digibook-navigation-chapter-title');

    chapterDiv.classList.add('h5p-digibook-navigation-chapter');


    sectionsDiv.classList.add('h5p-digibook-navigation-sectionlist');

    
    title.innerHTML = chapter.title;
    title.setAttribute("title", chapter.title);

    const arrowIcon = document.createElement('span');
    const circleIcon = document.createElement('span');

    arrowIcon.classList.add('icon-collapsed');
    if (this.behaviour.progressIndicators) {
      circleIcon.classList.add('icon-chapter-blank', 'h5p-digibook-navigation-chapter-progress');
    }



    titleDiv.appendChild(arrowIcon);
    titleDiv.appendChild(title);
    titleDiv.appendChild(circleIcon);

    chapterDiv.appendChild(titleDiv);

    titleDiv.onclick = (event) => {
      this.toggleChapter(event);
    };

    chapter.hasTasks = false;

    // Add sections to the chapter
    const sections = this.parent.instances[chapterIndex].childInstances;
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      
      const singleSection = document.createElement('div');
      const a = document.createElement('a');
      singleSection.classList.add('h5p-digibook-navigation-section');
      a.innerHTML = section.title;
      // icon.classList.add('h5p-digibook-navigation-section-taskicon');
      a.classList.add('icon-chapter-blank');
      
      if (section.isTask) {
        a.classList.add('h5p-digibook-navigation-section-task');
      }
      // singleSection.appendChild(icon);
      
      singleSection.appendChild(a);
      
      sectionsDiv.appendChild(singleSection);
      
      a.onclick = () => {
        that.parent.trigger('newChapter', {
          h5pbookid: that.parent.contentId,
          chapter: chapterIndex,
          section: i
        });
      };
    }
    if (chapter.tasksLeft) {
      chapter.maxTasks = chapter.tasksLeft;
    }
    chapterDiv.appendChild(sectionsDiv);

    
    return {
      chapterDiv,
      sectionsDiv,
      sections
    };
  }

  getChapterElements() {
    let tmp = [];
    for (let i = 0; i < this.chapters.length; i++) {
      const chapter = this.chapters[i];      
      const elem = this.createElemFromChapter(chapter, i);
      tmp.push(elem.chapterDiv);
    }
    return tmp;
  }


  /**
   * Parses the library which is used
   * TODO: Implement a more flexible system for library/title detection
   * @param {string} input 
   */
  parseLibrary(input) {
    let tmp;

    switch (input.library.split(" ")[0]) {

      case "H5P.AdvancedText":
        // Finds the first H2-element inside a text-document
        tmp = input.params.text.match(/<h2>(.+)<\/h2>/);
        if (tmp)
          tmp = tmp[1];
        else
          tmp = "Unnamed paragraph";
        break;

      case "H5P.Image":
        tmp = input.params.alt;
        break;
      default:
        tmp = input.library;
        break;
    }
    return tmp;
  }
}
export default SideBar;