/**
 * A component which helps in navigation
 * Constructor function.
 */
class SideBar extends H5P.EventDispatcher {
  constructor(config, contentId, mainTitle, parent) {
    super();
    this.id = contentId;
    this.parent = parent;
    this.behaviour = config.behaviour;
    this.content = document.createElement('div');
    this.div = this.addSideBar();

    this.chapters = this.findAllChapters(config.chapters);
    this.chapterElems = this.getChapterElements();
    
    
    if (mainTitle) {
      this.titleElem = this.addMainTitle(mainTitle);
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
    p.setAttribute('title', title);
    div.appendChild(p);
    return {
      div,
      p
    };
  }


  findSectionsInChapter(input) {
    const tmp = [];
    const sections = input.params.content;
    for (let j = 0; j < sections.length; j++) {
      try {
        const content = sections[j].content;
        const title = content.metadata.title;
        const id = content.subContentId;
        tmp.push({
          title,
          id
        });
      }
      catch (err) {
        continue;
      }
    }
    return tmp;
  }

  findAllChapters(input) {
    const chapters = [];
    for (let i = 0; i < input.length; i++) {
      const sections = this.findSectionsInChapter(input[i]);
      const chapterTitle = input[i].metadata.title;
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
  

  /**
   * Fires whenever a redirect is happening in parent
   * All chapters will be collapsed except for the active
   * 
   * @param {number} newChapter - The chapter that should stay open in the menu 
   */
  redirectHandler(newChapter) {
    this.chapterElems.filter(x => 
      this.chapterElems.indexOf(x) != newChapter).forEach(x => this.editChapterStatus(x, true));


    const targetElem = this.chapterElems[newChapter];
    this.editChapterStatus(targetElem, false);
  }

  /**
   * Manually set the target chapter as complete
   * @param {number} current - Current chapter
   */
  setChapterIndicatorComplete(current) {
    let targetElem = this.chapterElems[current].getElementsByClassName('h5p-digibook-navigation-chapter-title')[0];
    targetElem = targetElem.getElementsByClassName('h5p-digibook-navigation-chapter-progress')[0];
    targetElem.classList.remove('icon-chapter-blank');
    targetElem.classList.add('icon-chapter-done');
  }

  /**
   * Update the indicator on a spesific chapter.
   * 
   * @param {number} targetChapter - The chapter that should be updated
   */
  updateChapterProgressIndicator(targetChapter, status) {

    let targetElem = this.chapterElems[targetChapter].getElementsByClassName('h5p-digibook-navigation-chapter-title')[0];
    targetElem = targetElem.getElementsByClassName('h5p-digibook-navigation-chapter-progress')[0];

    if (status === 'BLANK') {
      targetElem.classList.remove('icon-chapter-started', 'icon-chapter-done');
      targetElem.classList.add('icon-chapter-blank');
    }
    else if (status === 'DONE') {
      targetElem.classList.remove('icon-chapter-blank', 'icon-chapter-started');
      targetElem.classList.add('icon-chapter-done');
    }
    else if (status === 'STARTED') {
      targetElem.classList.remove('icon-chapter-blank', 'icon-chapter-done');
      targetElem.classList.add('icon-chapter-started');
    }
  }

  setSectionMarker(targetChapter, targetSection) {
    const tmp = this.chapterElems[targetChapter].getElementsByClassName('h5p-digibook-navigation-section')[targetSection];
    const icon = tmp.getElementsByTagName('span')[0];
    if (icon) {
      icon.classList.remove('icon-chapter-blank');
      icon.classList.add('icon-question-answered');
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

    arrowIcon.classList.add('icon-collapsed', 'h5p-digibook-navigation-chapter-accordion');
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

    // Add sections to the chapter
    for (let i = 0; i < this.chapters[chapterIndex].sections.length; i++) {
      const section = this.chapters[chapterIndex].sections[i];
      
      const singleSection = document.createElement('div');
      const a = document.createElement('a');
      const span = document.createElement('span');
      const icon = document.createElement('span');
      singleSection.classList.add('h5p-digibook-navigation-section');
      span.innerHTML = section.title;
      span.setAttribute('title', section.title);
      span.classList.add('digibook-sectiontitle');
      icon.classList.add('icon-chapter-blank');
      
      if (this.parent.instances[chapterIndex].childInstances[i].isTask) {
        icon.classList.add('h5p-digibook-navigation-section-task');
      }
      a.appendChild(icon);

      a.appendChild(span);
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
      sectionsDiv
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

}
export default SideBar;