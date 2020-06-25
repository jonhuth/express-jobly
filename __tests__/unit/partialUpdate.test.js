const sqlForPartialUpdate = require("../../helpers/partialUpdate");

describe("partialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field",
    function () {
      let obj = sqlForPartialUpdate('companies', {'num_employees': 56}, 'handle', 'apple1');
      let hardCoded = { query:
        'UPDATE companies SET num_employees=$1 WHERE handle=$2 RETURNING *',
       values: [ 56, 'apple1' ] }

      // FIXME: write real tests!
      expect(obj).toEqual(hardCoded);

    });

});
