#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import axios from 'axios';
import prompts from 'prompts';
import { exec } from 'child_process';
import ora from 'ora';

const program = new Command();

program
  .name('component-cli')
  .description('A CLI to add components to your project.')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize your project with the necessary styles and dependencies.')
  .action(async () => {
    console.log("Welcome to the component library initializer!");
    const responses = await prompts([
      {
        type: 'text',
        name: 'tailwindConfigPath',
        message: 'Where is your tailwind.config.js file?',
        initial: 'tailwind.config.js'
      },
      {
        type: 'text',
        name: 'cssFilePath',
        message: 'Where is your global CSS file?',
        initial: 'src/index.css'
      },
      {
        type: 'confirm',
        name: 'useTypescript',
        message: 'Are you using TypeScript?',
        initial: true
      }
    ]);

    console.log('Configuration:', responses);
    // Add more initialization logic here
  });

program
  .command('add <component>')
  .description('Add a component to your project.')
  .action(async (componentName) => {
    const spinner = ora('Adding component...').start();
    try {
      // In a real CLI, you'd fetch this from a remote URL
      const registryPath = path.join(process.cwd(), '..', 'registry.json');
      const registry = await fs.readJson(registryPath);

      const component = registry.components[componentName];

      if (!component) {
        spinner.fail(`Component '${componentName}' not found in registry.`);
        return;
      }

      for (const file of component.files) {
        const response = await axios.get(file.sourcePath);
        const sourceContent = response.data;
        const destinationPath = path.join(process.cwd(), '..', file.path);
        
        await fs.ensureDir(path.dirname(destinationPath));
        await fs.writeFile(destinationPath, sourceContent);
        spinner.succeed(`Added component: ${file.path}`);
      }

      if (component.dependencies && component.dependencies.length > 0) {
        spinner.start('Installing dependencies...');
        const deps = component.dependencies.join(' ');
        exec(`npm install ${deps}`, (err, stdout, stderr) => {
          if (err) {
            spinner.fail('Failed to install dependencies.');
            console.error(stderr);
            return;
          }
          spinner.succeed('Dependencies installed.');
        });
      }

    } catch (error) {
      spinner.fail('Error adding component.');
      console.error(error);
    }
  });

program.parse();
