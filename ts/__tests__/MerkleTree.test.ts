const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const assert = chai.assert;

import { MemStorage } from '../storage'
import { Mimc7Hasher } from '../hashers'
import MerkleTree from '../merkletree'

const storage = new MemStorage()

jest.setTimeout(9000)

describe('tree test', function () {
    const prefix = 'test';
    const default_value = '4';
    const depth = 2
    const hasher = new Mimc7Hasher();
    let rollback_root

    const tree = new MerkleTree(
        prefix,
        storage,
        hasher,
        depth,
        default_value,
    );

    it('tests index', async () => {
        assert.equal(
            MerkleTree.index_to_key('test', 5, 20),
            "test_tree_5_20",
        );
    });

    it('tests empty get', async () => {
        let { root, path_elements, path_index } = await tree.path(2);
        const calculated_root = hasher.hash(1,
            path_elements[1],
            hasher.hash(0, default_value, path_elements[0]),
        );
        assert.equal(root, calculated_root);
    });

    it('tests insert', async () => {
        await tree.update(0, '5');
        rollback_root = (await tree.path(0)).root;
        let { root, path_elements, path_index } = await tree.path(0);
        const calculated_root = hasher.hash(1,
            hasher.hash(0, '5', path_elements[0]),
            path_elements[1],
        );
        assert.equal(root, calculated_root);
    });

    it('tests updated', async () => {
        await tree.update(1, '6');
        await tree.update(2, '9');
        await tree.update(2, '8');
        await tree.update(2, '82');
        let { root, path_elements, path_index } = await tree.path(0);
        const calculated_root = hasher.hash(1,
            hasher.hash(0, '5', path_elements[0]),
            path_elements[1],
        );
        assert.equal(root, calculated_root);
        const wrong_calculated_root = hasher.hash(1,
            hasher.hash(0, '6', path_elements[0]),
            path_elements[1],
        );
        assert.notEqual(root, wrong_calculated_root);
    });

    it('tests update log', async () => {
        const update_log_key = MerkleTree.update_log_to_key(prefix);
        const update_log_index = await tree.storage.get(update_log_key);
        assert.equal(update_log_index, 4);
        const update_log_element_key = MerkleTree.update_log_element_to_key(prefix, update_log_index);
        const update_log_element = JSON.parse(await tree.storage.get(update_log_element_key));
        assert.equal(update_log_element.old_element, '8');
        assert.equal(update_log_element.new_element, '82');
    });

    it('tests rollback', async () => {
        {
            await tree.rollback(1);
            const update_log_key = MerkleTree.update_log_to_key(prefix);
            const update_log_index = await tree.storage.get(update_log_key);
            assert.equal(update_log_index, 3);
            const update_log_element_key = MerkleTree.update_log_element_to_key(prefix, update_log_index);
            const update_log_element = JSON.parse(await tree.storage.get(update_log_element_key));
            assert.equal(update_log_element.old_element, '9');
            assert.equal(update_log_element.new_element, '8');
        }

        {
            await tree.rollback(1);
            const update_log_key = MerkleTree.update_log_to_key(prefix);
            const update_log_index = await tree.storage.get(update_log_key);
            assert.equal(update_log_index, 2);
            const update_log_element_key = MerkleTree.update_log_element_to_key(prefix, update_log_index);
            const update_log_element = JSON.parse(await tree.storage.get(update_log_element_key));
            assert.equal(update_log_element.old_element, '4');
            assert.equal(update_log_element.new_element, '9');
        }

        {
            await tree.rollback_to_root(rollback_root)
            const update_log_key = MerkleTree.update_log_to_key(prefix);
            const update_log_index = await tree.storage.get(update_log_key);
            assert.equal(update_log_index, 1);
            const update_log_element_key = MerkleTree.update_log_element_to_key(prefix, update_log_index);
            const update_log_element = JSON.parse(await tree.storage.get(update_log_element_key));
            assert.equal(update_log_element.old_element, '4');
            assert.equal(update_log_element.new_element, '6');
        }
    })

    it('tests if path consistent', async () => {
        await tree.update(1, '6');
        await tree.update(2, '9');
        await tree.update(3, '8');
        await tree.update(4, '82');

        const p1 = await tree.path(2);

        const index = await tree.element_index('9')
        const p2 = await tree.path(index)

        assert.strictEqual(index, 2)
        assert.equal(typeof (index), "number")
        assert.equal(p1.path_elements.toString(), p2.path_elements.toString());
    });
})
