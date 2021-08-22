import IHasher from './ihasher'
import * as circomlib from 'circomlib'
const mimcsponge = circomlib.mimcsponge

const bigInt = require('big-integer')

class MimcSpongeHasher implements IHasher {
    public hash(_, left, right) {
        return mimcsponge.multiHash([bigInt(left), bigInt(right)]).toString()
    }
}

export default MimcSpongeHasher
