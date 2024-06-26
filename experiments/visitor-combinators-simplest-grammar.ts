/***********************
 translating the examples from the paper using es 6 classes
***********************/

// The tree: Node ::= Fork Node Node | Leaf Integer

type Tree = Fork | Leaf;

class Fork implements Visitable {
  left: Tree
  right: Tree

  constructor(left:Tree, right:Tree) { 
    this.left = left; 
    this.right=right 
  }
  
  accept(visitor: Visitor): void {
    visitor.visitFork(this);
  }
}

class Leaf implements Visitable {
  value: number

  constructor(value: number) {
    this.value = value;
  }
  
  accept(visitor: Visitor): void {
    visitor.visitLeaf(this);
  }
}

interface Visitable {
  accept(visitor: Visitor): void;
}

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

  * has Identity as left-zero, but not as right-zero

    Choice(Fail, v)     = v
    Choice(v, Fail)     = v
    Choice(Identity, v) = Identity
***********************/

class VisitFailure extends Error {
  constructor(message: string, asserter?: Function) {
    super(message);
    Error.captureStackTrace?.(this, asserter || this.constructor);
  }
}

export function isVisitFailure(err: any): err is VisitFailure {
  return err instanceof VisitFailure;
}

// The Failure combinator
class Fail implements Visitor {
  visitFork(fork: Fork): void {
    throw new VisitFailure("Fail");
  }

  visitLeaf(leaf: Leaf): void {
    throw new VisitFailure("Fail");
  }
}

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
      if (isVisitFailure(err)) {
        tree.accept(this.then);
      } else {
        throw err;
      }
    }
  }

  visitLeaf(leaf: Leaf) {
    this.apply(leaf);
  }

  visitFork(fork: Fork): void {
    this.apply(fork);
  }
}

/*********************************************************
 * Example: using the Fail and Choice combinators 
 * to make visitors that conditionally fire at certain nodes
 * 
 *               Try(v) := Choice(v, Identity)
 *         IfZeroAddOne := Try( Sequence( IsZero, AddOne) )
 *********************************************************/

class IsZero extends Fail {
  visitLeaf(leaf: Leaf) {
    if (leaf.value !== 0) {
      throw new VisitFailure("NotZero");
    }
  }
}

class Try extends Choice {
  constructor(visitor: Visitor) {
    super(visitor, new Identity());
  }
}

class IfZeroAddOne extends Try {
  constructor() {
    super(new Sequence(new IsZero(), new AddOne()));
  }
}