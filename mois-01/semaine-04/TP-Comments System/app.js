import { InfinitePagination } from './js/InfinitePagination.js'
import { FetchForm } from './js/FetchForm.js'


document
  .querySelectorAll('.js-infinite-pagination')
  .forEach((element) => new InfinitePagination(element).start())

document
  .querySelectorAll('.js-form-fetch')
  .forEach((form) => new FetchForm(form).start())
