import ChildComponent from '@/core/component/child.component.js';
import renderService from '@/core/services/render.service.js';

import styles from './confession.module.scss';
import template from './confession.template.html';

export default class MiniConfession extends ChildComponent {
  render() {
    this.element = renderService.htmlToElement(template, [], styles);

    return this.element;
  }
}