import IHasher from './ihasher'
import * as circomlib from 'circomlib'
import * as snarkjs from 'snarkjs'
const poseidon = circomlib.poseidon

const bigInt = snarkjs.bigInt;

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
