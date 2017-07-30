const fetchGroups = (string) => {
  let keys = [];
  if(string) {
    // string: ((date eq '2016-05-01') AND (((name eq 'vignes') AND (age gt 25)) OR (number_of_calories lt 10)))
    const regEx = new RegExp(/(\([a-z0-9_$\-'",\.\\\[\]\{\}\: ]+\))/gi);
    let groups = string.match(regEx);
    if (groups) {
      do {
        groups.forEach((match) => {
          const processMatch = processOperator(match);
          keys = keys.concat(processMatch.keys);
          string = string.replace(match, processMatch.json)
        });
        groups = string.match(regEx) || [];
      } while(groups.length > 0);
    }
  } else {
    string = {};
  }
  return { json: string, keys };
};

const processOperator = (op) => {
  const keys = [];
  const words = op.replace('(', "").replace(')', "").split(' ');
  const query = {};
  if (words[1].search(/or/i) === 0 || words[1].search(/and/i) === 0) {
    let parsed0;
    let parsed2;
    try { parsed0 = JSON.parse(words[0]); } catch(err) {}
    try { parsed2 = JSON.parse(words[2]); } catch(err) {}
    query[`$${words[1]}`] = [parsed0 || words[0], parsed2 || words[2]];
  } else {
    keys.push(words[0]);
    query[words[0]] = {};
    query[words[0]][`$${words[1]}`] = words[2].replace(/^('|")(.*)('|")$/, '$2');
  }

  return { json: JSON.stringify(query), keys }
};

module.exports = fetchGroups;