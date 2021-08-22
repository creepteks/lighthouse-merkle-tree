import IHasher from './ihasher'
import * as circomlib from 'circomlib'
const poseidon = circomlib.poseidon

const bigInt = require('big-integer')

class PoseidonHasher implements IHasher {
    private hashFunc: Function

    constructor() {
        this.hashFunc = poseidon
    }

    public hash(_, left, right) {
        return this.hashFunc([left, right])
    }
}

export default PoseidonHasher
