// classes are in fact special functions, and as functions, you can define:
// functions expressions and functions declarations, a class can also have
// a class expression and a class declaration.

// declarations
class Rectangle {
    constructor(height, width) {
        this.height = height;
        this.width = width;
    }
}

// expression; class is anonymus but assigned to a variable
const Rectangle = class {
    constructor(height, width) {
        this.height = height;
        this.width = width;
    }
}

// unlike function declaractions, class declarations have the same temporal dead zone
// restrictions as let or const and behave as if they are not hoisted.

// A class element can be characterized by three aspects:
// Kind: Getter, Setter, Method, or Field
// Location: Static or Instance
// Visibility: Public or Private

// Private properties have the restriction that all property names declared in the same 
// class must be unique. All other public properties do not have this restriction

// The constructor is a special method for creating and initializing an object created
// with a class, there can only be one special method with the name "constructor" in a class.
// A constructor can use the super keyword to call the constructor of the super class.
// The constructor syntax is exactly the same as a normal function, which means you can use other
// syntaxes, like rest parameters.

// methods are defined on the prototype of each class and are shared by all instances.
// Methods can be plain functions, async functions, generator functions, or async generator functions.

class Square {
    constructor(height, width) {
        this.height = height;
        this.width = width;
    }

    // Getter
    get area() {
        return this.calcArea();
    }

    // Methods
    calcArea() {
        return this.height * this.width;
    }

    *getSides() {
        yield this.height
        yield this.width
        yield this.height
        yield this.width
    }
}

// Accessor fields allow us to manipulate something as if its an actual property:
class RBG {
    constructor(r,g,b) {
        this.values = [r,g,b];
    }

    get green() {
        return this.values[0]
    }

    set green(value) {
        this.values[0] = value
    }
}

const green = new RGB(0, 255, 0)
green.green = 0
console.log(green.green)
// If a field only has a getter butt no setter, it will be effectivelly read-only.

// Static properties with static attributes are defined on the class itself instead of each instance.

class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    static displayName = "Point"
    static distance(a,b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;

        return Math.hypot(dx, dy);
    }
}

const p1 = new Point(5, 5)
const p2 = new Point(10, 10)

p1.displayName // undefined
p2.displayName // undefined

Point.displayName // "Point"
Point.distance(p1, p2) // 7.0710678118654755

// Static members are not directly accessible using the this keyword from non-static methods. You need to call
// them using the class name or by calling the method as a property of the constructor: this.constructor.STATIC_MEMBER.

// Static initialization blocks are declared within a class. It contains statements to be evaluated during class initialization.
// This permits more flexible initialization logix than static properties, such as using try...catch or setting multiple fields
// from a single value.
// Statis initialization blocks allow arbitraty initialization logic to be declared within the class and executed during class evaluation.
class MyClass {
    static init() {
        // Access to private static fields is allowed here. However this approach exposes an implementation detail to the user of the class.
    }

    static {
        // This static initialization block is evaluated along with any interleaved static field initializers, in the order they are declared.
        // Any static initialization of a super class is performed first, before that of its sub classes.
        // The scope of variables declared inside the static block is local to the block, this includes var, functions, const, and let declarations.
        // var declarations in the block are not hoisted.
        // The this inside a static block refers to the constructor object of the class.
        // super.property can be used to access static properties of the super class.
        // Not that is a syntax error to call super in a class static initialization block.
        // The statements are evaluated synchronously. You cannot use await or yield in this block.
        // The scope of the static block is nested within the lexical scope of the class body, and can access private names declared within the class
        // without causing a syntax error.
        // Static fields initializers and static initialization blocks are evaluated one-by-one. The initialization block can refer to field values above it,
        // but not bellow it.
    }
}

MyClass.init()

// Example of class field declarations
class Triangle {
    base = 0;
    side1; // undefined
    side2; // undefined
    #height; // undefined

    // base is not optional here
    constructor(base, side1, side2, height){ 
        this.base = base;
        this.side1 = side1;
        this.side2 = side2;
        this.#height = height;
    }
}

// to declare a private attribute or method we preppend the field with an #.
// private fields can only be read of writen by the class that defines them.
// private fields can only be declared up-front in a field declaration. They
// cannot be created later through assigning to them.

class Animal {
    constructor(name) {
        this.name = name;
    }

    speak() {
        console.log(`${this.name} makes a noise.`)
    }
}

// A class method can read the private fields of another instances, as long as they
// belong to the same class.

class Color {
    #values;
    constructor(r,g,b) {
        this.#values = [r,g,b];
    }

    redDifference(anotherColor) {
        return this.#values[0] - anotherColor.#values[0];
    }
}

const red = new Color(255, 0, 0)
const crimson = new Color(220, 20, 60);
red.redDifference(crimson); // 35

// Accessing a nonexistent private property throws an error instead of returning undefined like normal properties.
// If you don't know if a private field exists on an object and you wish to access it without using try/catch, you can
// use the in operator.

class ColorA {
    #values;
    constructor(r,g,b) {
        this.#values = [r,g,b];
    }

    redDifference(anotherColor) {
        if (!(#values in anotherColor)) {
            throw new TypeError("Color instance expected");
        }
        return this.#values[0] - anotherColor.#values[0];
    }
}

// # is a special identifier syntax, and you can't use the field name as if it's a string. "#values" in anotherColor would
// look for a property name literally called "#values", instead of a private field.

// private fields cannot be deleted.

// If there's a constructor present in the subclass, it needs to first call super() before using this.
class Dog extends Animal {
    constructor(name) {
        super(name) // call the super class constructor and pass in the name parameter
    }

    speak() {
        console.log(`${this.name} barks.`)
    }
}

const dog = new Dog("Mitzie")
dog.speak() // Mitzie barks.

// When you use extends, the static methods inherit from each other as well, so you can also override or enhance them.

// The super keyword can also be used to call corresponding methods of super class.

class Cat {
    constructor(name) {
        this.name = name;
    }

    speak() {
        console.log(`${this.name} makes a noise.`);
    }
}

class Lion extends Cat {
    speak() {
        super.speak();
        console.log(`${this.name} roars.`);
    }
}

const lion = new Lion("Fuzzy");
lion.speak() // Fuzzy makes a noise.
             // Fuzzy roars.

// Evaluation order
// When a class declaration or class expression is evaluated, its components are evaluated in the following order:

// 1. The extends clause, if present, is first evaluated. It must evaluate to a valid constructor function or null, or a TypeError is thrown.
// 2. The constructor method is extracted, substituted with a default implementation if constructor is not present. However, because the constructor 
        // definition is only a method definition, this step is not observable.
// 3. The class elements' property keys are evaluated in the order of declaration. If the property key is computed, the computed expression is evaluated,
        // with the this value set to the this value surrounding the class (not the class itself). None of the property values are evaluated yet.
// 4. Methods and accessors are installed in the order of declaration. Instance methods and accessors are installed on the prototype property of the current 
        // class, and static methods and accessors are installed on the class itself. Private instance methods and accessors are saved to be installed on the 
        // instance directly later. This step is not observable.
// 5. The class is now initialized with the prototype specified by extends and implementation specified by constructor. For all steps above, if an evaluated 
        // expression tries to access the name of the class, a ReferenceError is thrown because the class is not initialized yet.
// 6. The class elements' values are evaluated in the order of declaration:
        // For each instance field (public or private), its initializer expression is saved. The initializer is evaluated during instance creation, at the start 
            // of the constructor (for base classes) or immediately before the super() call returns (for derived classes).
        // For each static field (public or private), its initializer is evaluated with this set to the class itself, and the property is created on the class.
        // Static initialization blocks are evaluated with this set to the class itself.
// 7. The class is now fully initialized and can be used as a constructor function.
