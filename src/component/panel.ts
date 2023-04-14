function insertTextList(label: string, text: string) {
  let templateDom = document.getElementById("text-li") as HTMLTemplateElement;
  let spanDom = templateDom.content.querySelectorAll("span")[0];
  spanDom.textContent = label;
  let inputDom = templateDom.content.querySelectorAll("input")[0];
  inputDom.value = text;

  let containerDom = document.getElementById("panel") as HTMLDivElement | null;
  let ulDom = containerDom?.querySelectorAll("ul")[0];
  let clone = document.importNode(templateDom.content, true);
  ulDom?.appendChild(clone);
}

function insertCheckboxList(label: string, value: boolean, callback: Function) {
  let templateDom = document.getElementById(
    "checkbox-li"
  ) as HTMLTemplateElement;
  let spanDom = templateDom.content.querySelectorAll("span")[0];
  spanDom.textContent = label;
  let checkboxDom = templateDom.content.querySelectorAll("input")[0];
  checkboxDom.checked = value;

  let containerDom = document.getElementById("panel") as HTMLDivElement | null;
  let ulDom = containerDom?.querySelectorAll("ul")[0];
  let clone = document.importNode(templateDom.content, true);
  clone.querySelectorAll("input")[0].onchange = (event) => {
    callback((<HTMLInputElement>event.target).checked);
  };
  ulDom?.appendChild(clone);
}

function removeListItems() {
  let containerDom = document.getElementById("container") as HTMLDivElement;
  let ulDom = containerDom.querySelectorAll("ul")[0];
  let liDoms = ulDom.querySelectorAll("li");
  for (let lidom of liDoms) ulDom.removeChild(lidom);
}

function initializeDrag() {
  let target = document.getElementById("panel") as HTMLElement;
  let relativeX: number;
  let relativeY: number;
  
  target.ondragstart = (event) => {
    relativeX = event.offsetX;
    relativeY = event.offsetY;
    target.style.opacity = "0";
  };

  target.ondrag = (event) => {
    let left = event.pageX - relativeX - window.pageXOffset;
    let width = target.getBoundingClientRect().width;
    let windowWidth = document.documentElement.clientWidth;
    target.style.top = event.pageY - relativeY - window.pageYOffset + "px";
    target.style.right = windowWidth - left - width + "px";
    target.style.opacity = "0.3";
  };

  target.ondragend = (event) => {
    let left = event.pageX - relativeX - window.pageXOffset;
    let width = target.getBoundingClientRect().width;
    let windowWidth = document.documentElement.clientWidth;
    target.style.top = event.pageY - relativeY - window.pageYOffset + "px";
    target.style.right = windowWidth - left - width + "px";
    target.style.removeProperty("opacity")
  };
}

export { insertTextList, insertCheckboxList, removeListItems, initializeDrag };
