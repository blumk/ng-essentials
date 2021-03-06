import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import { NgEssentialsOptions } from './schema';

import { addKarma } from './karma';
import { addJest } from './jest';
import { addCypress } from './cypress';
import { addTestcafe } from './testcafe';
import { addEssentials } from './essentials';

import { ANGULAR_JSON, NG_ESSENTIALS } from '../constants';
import { runNpmPackageInstall } from '../utils';

export default function(options: NgEssentialsOptions): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    options = readNgEssentialsOptionsFromAngularJson(tree, options);

    const rule = chain([
      addKarma(options),
      addJest(options),
      addCypress(options),
      addTestcafe(options),
      addEssentials(options),
      runNpmPackageInstall()
    ]);

    return rule(tree, _context);
  };
}

function readNgEssentialsOptionsFromAngularJson(host: Tree, options: NgEssentialsOptions): NgEssentialsOptions {
  options.firstRun = true;

  if (!host.exists(ANGULAR_JSON)) {
    return options;
  }

  const sourceText = host.read(ANGULAR_JSON).toString('utf-8');
  const angularJson = JSON.parse(sourceText);
  const defaultProject = angularJson['defaultProject'];
  const optionsFromAngularJson = angularJson['projects'][defaultProject]['schematics'][NG_ESSENTIALS];

  if (optionsFromAngularJson) {
    options.firstRun = false;
    options.jest = optionsFromAngularJson.jest;
    options.cypress = optionsFromAngularJson.cypress;
    options.testcafe = optionsFromAngularJson.testcafe;
  }

  return options;
}
