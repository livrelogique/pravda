import * as UnitTest from "./UnitTest.js";


export function same(obj1, obj2) {
    return JSON.stringify(obj1) == JSON.stringify(obj2);
}



export function contains(array: any[], element: any): boolean {
    for (let e of array) {
        if (same(e, element)) {
            return true;
        }
    }
    return false;
}

export function includes(bigArray: any[], array: any[]): boolean {
    for (let e of array) {
        if (!contains(bigArray, e)) {
            return false;
        }
    }
    return true;
}


/**
 * 
 * @param bigArray 
 * @param array 
 * @param element 
 * @return true iff bigArray = array U {element}
 */
export function isSetPlusElement(bigArray: any[], array: any[], element: any): boolean {
    if (bigArray.length != array.length + 1)
        return false;

    if (!contains(bigArray, element))
        return false;

    return includes(bigArray, array);
}



UnitTest.run("isSetPlusElement", isSetPlusElement(["p"], [], "p"));


export function setAdd(array: any[], element: any): void {
    if (!contains(array, element))
        array.push(element);
}