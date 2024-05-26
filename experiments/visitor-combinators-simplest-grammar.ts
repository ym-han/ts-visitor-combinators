/***********************
 translating the examples from the paper using es 6 classes
***********************/

// The tree: Node ::= Fork Node Node | Leaf Integer

type Tree = Fork | Leaf
type Fork = {
  type: "Fork",
  left: Tree,
  right: Tree,
  accept(visitor: Visitor): void;
}
type Leaf = {
  type: "Leaf",
  value: number,
  accept(visitor: Visitor): void;
}

// interface Visitable {
//   accept(visitor: Visitor): void;
// }

interface Visitor {
  visitLeaf(leaf: Leaf): void;
  visitFork(fork: Fork): void;
}

class Identity implements Visitor {
  visitLeaf(leaf: Leaf) { };
  visitFork(fork: Fork) { }
}

class AddOne extends Identity {
  visitLeaf(leaf: Leaf) {
    leaf.value += 1;
  }

  visitFork(fork: Fork): void { }
}

/***********************
 Sequence
***********************/

class Sequence implements Visitor {
  first: Visitor;
  then: Visitor;

  constructor(first: Visitor, then: Visitor) {
    this.first = first;
    this.then = then;
  }

  apply(tree: Tree) {
    tree.accept(this.first);
    tree.accept(this.then);
  }

  visitFork(fork: Fork) {
    this.apply(fork);
  }
  visitLeaf(leaf: Leaf) {
    this.apply(leaf);
  }
}

class Twice extends Sequence {
  constructor(visitor: Visitor) {
    super(visitor, visitor);
  }
}

class AddTwo extends Twice {
  constructor() {
    super(new AddOne());
  }
}


/***********************
 Choice
***********************/

class Choice implements Visitor {
  first: Visitor;
  then: Visitor;

  constructor(first: Visitor, then: Visitor) {
    this.first = first;
    this.then = then;
  }

  apply(tree: Tree) {
    try {
      tree.accept(this.first);
    } catch (err) {
      tree.accept(this.then);
    }

  }
  visitLeaf(leaf: Leaf) {
    this.apply(leaf);
  }

  visitFork(fork: Fork): void {
    this.apply(fork);
  }
}