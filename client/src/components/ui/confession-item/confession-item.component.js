import ChildComponent from '@/core/component/child.component.js';
import renderService from '@/core/services/render.service.js';

import styles from './confession-item.module.scss';
import template from './confession-item.template.html';

export default class ConfessionItem extends ChildComponent {
  render() {
    this.element = renderService.htmlToElement(template, [], styles);

    return this.element;
  }
}