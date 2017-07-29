const fetchGroups = (string) => {
  // string: ((date eq '2016-05-01') AND (((name eq 'vignes') AND (age gt 25)) OR (number_of_calories lt 10)))
  const regEx = new RegExp(/(\([a-z0-9_$\-'",\\\[\]\{\}\: ]+\))/gi);
  let groups = string.match(regEx);
  do {
    groups.forEach((match) => {
      string = string.replace(match, processOperator(match))
    });
    groups = string.match(regEx) || [];
  } while(groups.length > 0);
  return string
};

const processOperator = (op) => {
  const words = op.replace('(', "").replace(')', "").split(' ');
  const query = {};
  if (words[1].search(/or/i) === 0 || words[1].search(/and/i) === 0) {
    let parsed0;
    let parsed2;
    try { parsed0 = JSON.parse(words[0]); } catch(err) {}
    try { parsed2 = JSON.parse(words[2]); } catch(err) {}
    query[`$${words[1]}`] = [parsed0 || words[0], parsed2 || words[2]];
  } else {
    query[words[0]] = {};
    query[words[0]][`$${words[1]}`] = words[2];
  }

  return JSON.stringify(query)
};

module.exports = fetchGroups;