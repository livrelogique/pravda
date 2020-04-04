import * as UnitTest from "./UnitTest.js";

/**
 * 
 * @param obj1 
 * @param obj2 
 * @return true iff the two objects obj1 and obj2 are the same
 */
export function same(obj1, obj2) {
    return JSON.stringify(obj1) == JSON.stringify(obj2);
}
/*
export function same(obj1, obj2) {
    if (obj1 instanceof Array) {
        if (!(obj2 instanceof Array))
            return false;

        if (obj1.length != obj2.length)
            return false;

        for (let i in obj1)
            if (!same(obj1[i], obj2[i]))
                return false;

        return true;
    }
    else if (typeof obj1 == "string") {
        return obj1 == obj2;
    }
    else if (obj1.type != obj2.type)
        return false;
    else
        return same(obj1.args, obj2.args);
}
*/


export function contains(array: any[], element: any): boolean {
    for (let e of array) {
        if (same(e, element)) {
            return true;
        }
    }
    return false;
}

export function includes(bigArray: any[], array: any[]): boolean {
    if (bigArray.length < array.length)
        return false;

    for (const e of array) {
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