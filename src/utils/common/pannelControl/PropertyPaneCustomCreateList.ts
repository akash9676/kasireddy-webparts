import {
  IPropertyPaneField,
  IPropertyPaneCustomFieldProps,
  PropertyPaneFieldType,
} from "@microsoft/sp-property-pane";
export interface IPropertyPaneCustomCreateListProps {
  properties: any;
  label: string;
  description?: string;
  defaultvalue?: string;
  onCreateButtonClick: (newValue: any) => void;
}
export class PropertyPaneCustomCreateList
  implements IPropertyPaneField<IPropertyPaneCustomFieldProps>
{
  public type: any = PropertyPaneFieldType.Custom;
  public targetProperty: string;
  public properties: IPropertyPaneCustomFieldProps;
  private config: IPropertyPaneCustomCreateListProps;
  private currentValue: string = "";

  constructor(
    targetProperty: string,
    config: IPropertyPaneCustomCreateListProps,
    context?: any
  ) {
    this.targetProperty = targetProperty;
    this.properties = {
      key: "MyCustomControl",
      context: context,
      onRender: this.render.bind(this),
      onDispose: this.dispose.bind(this),
    };
    this.config = config;
  }
  private render(
    element: HTMLElement,
    context: any,
    changeCallback: (targetProperty: string, newValue: any) => void
  ) {
    this.currentValue = this.config.properties[this.targetProperty];
    let createListHtml = `<div>
       <div>
         <span
           className=''
           onClick={toggleCreateList}
           title="Create New List"
         ></span>
       </div>
       <div>
           <div
             className=''>
             <label className=''>
               Create New List
             </label>
             <input
               className=''
               type="listName"
               id="txtListName"
               value=${this.currentValue || this.config.defaultvalue || ""}
             ></input>
             <button
               type="button"
               className='' 
             >
               Create
             </button>
           </div>
               <div className=''>
                 &nbsp;&nbsp;
                 {message}
               </div>
         </div>
     </div>`;
    element.innerHTML = createListHtml;
    this.addEvents(element, changeCallback);
  }
  private dispose(element: HTMLElement) {
    element.innerHTML = "";
  }

  private addEvents(
    element: HTMLElement,
    callback: (targetProperty: string, newValue: any) => void
  ) {
    let inputTextElement: HTMLInputElement =
      element.getElementsByTagName("input")[0];
    let inputButtonElement: HTMLButtonElement =
      element.getElementsByTagName("button")[0];
    inputButtonElement.onclick = () => {
      this.applyButtonChanges(element, inputTextElement, callback);
    };
  }
  private applyButtonChanges(
    element: HTMLElement,
    inputButtonElement: HTMLInputElement,
    callback: (targetProperty: string, newValue: any) => void
  ) {
    let newValue = inputButtonElement.value;
    callback(this.targetProperty, this.config.onCreateButtonClick(newValue));
  }
}
