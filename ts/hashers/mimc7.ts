import IHasher from './ihasher'
import * as circomlib from 'circomlib'

const mimc7 = circomlib.mimc7
const bigInt = require('big-integer')

class Mimc7Hasher implements IHasher {
    public hash(_, left, right) {
        return mimc7.multiHash([bigInt(left), bigInt(right)]).toString()
    }
}

export default Mimc7Hasher

