#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import axios from 'axios';
import prompts from 'prompts';

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
    try {
      // In a real CLI, you'd fetch this from a remote URL
      const registryPath = path.join(process.cwd(), '..', 'registry.json');
      const registry = await fs.readJson(registryPath);

      const component = registry.components[componentName];

      if (!component) {
        console.error(`Component '${componentName}' not found in registry.`);
        return;
      }

      for (const file of component.files) {
        const response = await axios.get(file.sourcePath);
        const sourceContent = response.data;
        const destinationPath = path.join(process.cwd(), '..', file.path);
        
        await fs.ensureDir(path.dirname(destinationPath));
        await fs.writeFile(destinationPath, sourceContent);
        console.log(`Added component: ${file.path}`);
      }

      if (component.dependencies && component.dependencies.length > 0) {
        console.log('Installing dependencies...');
        // Here you would run npm install for the dependencies
        console.log(component.dependencies.join(' '));
      }

    } catch (error) {
      console.error('Error adding component:', error);
    }
  });

program.parse();