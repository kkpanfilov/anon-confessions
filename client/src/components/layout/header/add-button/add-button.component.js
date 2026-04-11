import ChildComponent from '@/core/component/child.component.js';
import renderService from '@/core/services/render.service.js';

import styles from './add-button.module.scss';
import template from './add-button.template.html';

export default class AddButton extends ChildComponent {
  // TODO: В шаблоне ссылка оборачивает button. Это невалидная вложенность интерактивных элементов; оставь либо стилизованную <a>, либо button с программной навигацией.
  render() {
    this.element = renderService.htmlToElement(template, {}, styles);

    return this.element;
  }
}
