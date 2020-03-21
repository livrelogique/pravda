export function same(obj1, obj2) {
    return JSON.stringify(obj1) == JSON.stringify(obj2);
}



export function contains(element: any, array: any[]): boolean {
    for (let e of array) {
        if (same(e, element)) {
            return true;
        }
    }
    return false;
}



export function setAdd(array: any[], element: any): void {
    if (!contains(element, array))
        array.push(element);
}