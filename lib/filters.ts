import type {Todo} from './db';
import {singaporeDateKey} from './timezone';
export type Filters={search:string;priority:string;tagId:string;completion:string;dueDateFrom:string;dueDateTo:string};
export const initialFilters:Filters={search:'',priority:'',tagId:'',completion:'',dueDateFrom:'',dueDateTo:''};
/** Apply every selected filter with AND semantics, including title, subtask, and tag search. */
export function applyFilters(todos:Todo[],filters:Filters):Todo[]{
  const search=filters.search.trim().toLocaleLowerCase();
  return todos.filter(todo=>{
    if(search && !todo.title.toLocaleLowerCase().includes(search) && !todo.subtasks.some(s=>s.title.toLocaleLowerCase().includes(search)) && !todo.tags.some(t=>t.name.toLocaleLowerCase().includes(search)))return false;
    if(filters.priority && todo.priority!==filters.priority)return false;
    if(filters.tagId && !todo.tags.some(t=>String(t.id)===filters.tagId))return false;
    if(filters.completion && String(todo.completed)!==filters.completion)return false;
    const dueDate=(filters.dueDateFrom||filters.dueDateTo)&&todo.due_date?singaporeDateKey(todo.due_date):null;
    if(filters.dueDateFrom && (!dueDate || dueDate<filters.dueDateFrom))return false;
    if(filters.dueDateTo && (!dueDate || dueDate>filters.dueDateTo))return false;
    return true;
  });
}
export function progress(completed:number,total:number):number{return total?Math.floor(completed/total*100):0}
export function activeFilterKey(userId:number){return `todo-app:active-filters:${userId}`}
export function parseStoredFilters(raw:string|null):Filters {
  try {
    const data=JSON.parse(raw||'null') as Partial<Filters>|null;if(!data||typeof data!=='object')return {...initialFilters};
    return {search:typeof data.search==='string'?data.search.slice(0,500):'',priority:['high','medium','low'].includes(data.priority||'')?data.priority!:'',tagId:/^\d+$/.test(data.tagId||'')?data.tagId!:'',completion:['true','false'].includes(data.completion||'')?data.completion!:'',dueDateFrom:/^\d{4}-\d{2}-\d{2}$/.test(data.dueDateFrom||'')?data.dueDateFrom!:'',dueDateTo:/^\d{4}-\d{2}-\d{2}$/.test(data.dueDateTo||'')?data.dueDateTo!:''};
  }catch{return {...initialFilters}}
}
