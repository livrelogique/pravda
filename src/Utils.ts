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


/**
 * 
 * @param array 
 * @param element 
 * @returns true if array contains element (in the sense, )
 */
export function contains(array: any[], element: any): boolean {
    for (let e of array) {
        if (same(e, element)) {
            return true;
        }
    }
    return false;
}



/**
 * 
 * @param bigArray 
 * @param array 
 * @returns true iff bigArray includes array
 */
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
        
    if (contains(array, element))
        return false;

    return includes(bigArray, array);
}


/**
 *
 * @param array1
 * @param array2
 * @return true iff array1 interesected with array2 is not empty
 */
export function isNotEmptyIntersection(array1: any[], array2: any[]): boolean {
    for (let e of array1) {
        if (contains(array2, e)) {
            return true;
        }
    }

    return false;
}

UnitTest.run("isNotEmptyIntersection", isNotEmptyIntersection(["p", "q"], ["p"]));
UnitTest.run("isNotEmptyIntersection", isNotEmptyIntersection(["p"], ["p"]));
UnitTest.run("isNotEmptyIntersection", !isNotEmptyIntersection(["q"], ["p"]));

UnitTest.run("isSetPlusElement", isSetPlusElement(["p"], [], "p"));
UnitTest.run("isSetPlusElement", isSetPlusElement(["p", "q"], ["p"], "q"));
UnitTest.run("isSetPlusElement", !isSetPlusElement(["p", "q"], ["p"], "p"));


export function setAdd(array: any[], element: any): void {
    if (!contains(array, element))
        array.push(element);
}


/**
 *
 * @param array
 * @param element
 * @returns Nothing, but removes one occurrence of element from array if it existed
 */
function remove(array: any[], element: any) {
    let found = false;
    let i = 0;
    while (i < array.length && !found) {
        if (same(element, array[i])) {
            array.splice(i, 1);
            found = true;
        }
        i++;
    }
}

/**
 *
 * @param bigArray
 * @param array
 * @returns An array containing all elements in [bigArray] that are not in [array]
 */
export function multisetDifference(bigArray: any[], array: any[]): any[] {
    let newArray = bigArray.slice(); // Copy of bigArray
    for (let e of array) {
        remove(newArray, e);
    }

    return newArray
}

/**
 *
 * @param bigArray
 * @param array
 * @param element
 * @return true iff bigArray = array U {element}
 */
export function isMultisetPlusElement(bigArray: any[], array: any[], element: any): boolean {
    if (bigArray.length != array.length + 1)
        return false;

    let bigCount = bigArray.filter(x => same(x, element)).length;
    let count = array.filter(x => same(x, element)).length;

    if (bigCount != count + 1) { return false; }

    return includes(bigArray, array);
}

UnitTest.run("setMinus1", multisetDifference(["p", "q"], ["q"])[0] == "p");
UnitTest.run("setMinus2", multisetDifference(["p", "p"], ["p"])[0] == "p");
