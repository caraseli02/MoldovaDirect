#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const helpMessage = `\nUsage: node scripts/setup-github-project.mjs --owner=<login> --title="Project Title" [options]\n\nOptions:\n  --owner=<login>           GitHub user or organization that will own the project (required).\n  --title="<title>"        Title for the project (required).\n  --areas="A,B"            Comma-delimited list of area names to seed (default: Admin,API,Authentication,Checkout,Payments,Security,Performance,Mobile,User Facing,UX,Analytics,Compliance,Quality).\n  --priority="P1,P2"       Comma-delimited list of priority levels (default: Critical,High,Medium,Low).\n  --output="<path>"        File path for the generated automation config (default: project-automation.config.json).\n\nEnvironment variables:\n  GITHUB_TOKEN              Personal access token with project and repo scope (required).\n\nExample:\n  GITHUB_TOKEN=ghp_xxx node scripts/setup-github-project.mjs --owner=my-org --title="Product Delivery"\n`;

const defaultAreaNames = [
  'Admin',
  'API',
  'Authentication',
  'Checkout',
  'Payments',
  'Security',
  'Performance',
  'Mobile',
  'User Facing',
  'UX',
  'Analytics',
  'Compliance',
  'Quality'
];

const defaultStageLabelMappings = {
  ready: 'Ready',
  'in-progress': 'In Progress',
  review: 'Review',
  blocked: 'Blocked',
  'needs-spec': 'Backlog',
  'needs-design': 'Backlog',
  'needs-estimate': 'Backlog',
  triage: 'Backlog'
};

const defaultPriorityLabelMappings = {
  'priority/critical': 'Critical',
  'priority/high': 'High',
  'priority/medium': 'Medium',
  'priority/low': 'Low',
  critical: 'Critical',
  'high-priority': 'High',
  'medium-priority': 'Medium',
  'low-priority': 'Low',
  p0: 'Critical',
  'p0-critical': 'Critical',
  p1: 'High',
  'p1-high': 'High',
  p2: 'Medium',
  p3: 'Low'
};

const defaultAreaLabelMappings = {
  admin: 'Admin',
  api: 'API',
  authentication: 'Authentication',
  mfa: 'Authentication',
  checkout: 'Checkout',
  payments: 'Payments',
  security: 'Security',
  'high-priority-security': 'Security',
  performance: 'Performance',
  mobile: 'Mobile',
  'user-facing': 'User Facing',
  ux: 'UX',
  analytics: 'Analytics',
  compliance: 'Compliance',
  quality: 'Quality',
  testing: 'Quality'
};

function parseArgs(argv) {
  const args = {};
  for (const entry of argv.slice(2)) {
    if (entry === '--help' || entry === '-h') {
      args.help = true;
      continue;
    }
    const [key, value] = entry.split('=');
    if (!value) {
      console.error(`Invalid argument: ${entry}`);
      process.exit(1);
    }
    const normalizedKey = key.replace(/^--/, '');
    args[normalizedKey] = value;
  }
  return args;
}

async function graphqlRequest(token, query, variables = {}) {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'moldova-direct-project-bootstrap'
    },
    body: JSON.stringify({ query, variables })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API responded with ${response.status}: ${text}`);
  }

  const payload = await response.json();
  if (payload.errors) {
    const message = payload.errors.map((err) => err.message).join('\n');
    throw new Error(`GitHub API error: ${message}`);
  }
  return payload.data;
}

async function resolveOwnerId(token, login) {
  const query = `
    query($login: String!) {
      organization(login: $login) { id }
      user(login: $login) { id }
    }
  `;
  const data = await graphqlRequest(token, query, { login });
  if (data.organization?.id) {
    return { id: data.organization.id, type: 'organization' };
  }
  if (data.user?.id) {
    return { id: data.user.id, type: 'user' };
  }
  throw new Error(`Owner '${login}' not found as user or organization.`);
}

async function createProject(token, ownerId, title) {
  const mutation = `
    mutation($ownerId: ID!, $title: String!) {
      createProjectV2(input: { ownerId: $ownerId, title: $title }) {
        projectV2 { id number title url }
      }
    }
  `;
  const data = await graphqlRequest(token, mutation, { ownerId, title });
  return data.createProjectV2.projectV2;
}

async function createSingleSelectField(token, projectId, name, options) {
  const mutation = `
    mutation($projectId: ID!, $name: String!, $options: [ProjectV2SingleSelectFieldOptionInput!]!) {
      createProjectV2Field(input: {
        projectId: $projectId,
        data: {
          name: $name,
          dataType: SINGLE_SELECT,
          singleSelectOptions: $options
        }
      }) {
        projectV2Field {
          ... on ProjectV2SingleSelectField {
            id
            name
            options { id name }
          }
          id
          name
        }
      }
    }
  `;
  const data = await graphqlRequest(token, mutation, {
    projectId,
    name,
    options: options.map((option) => ({
      name: option.name,
      color: option.color
    }))
  });
  const field = data.createProjectV2Field.projectV2Field;
  return {
    id: field.id,
    name: field.name,
    options: Object.fromEntries(field.options.map((option) => [option.name, option.id]))
  };
}

async function createTextField(token, projectId, name) {
  const mutation = `
    mutation($projectId: ID!, $name: String!) {
      createProjectV2Field(input: {
        projectId: $projectId,
        data: { name: $name, dataType: TEXT }
      }) {
        projectV2Field { id name }
      }
    }
  `;
  const data = await graphqlRequest(token, mutation, { projectId, name });
  return data.createProjectV2Field.projectV2Field;
}

async function createDateField(token, projectId, name) {
  const mutation = `
    mutation($projectId: ID!, $name: String!) {
      createProjectV2Field(input: {
        projectId: $projectId,
        data: { name: $name, dataType: DATE }
      }) {
        projectV2Field { id name }
      }
    }
  `;
  const data = await graphqlRequest(token, mutation, { projectId, name });
  return data.createProjectV2Field.projectV2Field;
}

async function createIterationField(token, projectId, name) {
  const mutation = `
    mutation($projectId: ID!, $name: String!) {
      createProjectV2Field(input: {
        projectId: $projectId,
        data: { name: $name, dataType: ITERATION }
      }) {
        projectV2Field { id name }
      }
    }
  `;
  const data = await graphqlRequest(token, mutation, { projectId, name });
  return data.createProjectV2Field.projectV2Field;
}

function buildOptions(list, palette) {
  const colors = Array.isArray(palette) ? palette : [];
  return list.map((name, index) => ({
    name,
    color: colors[index % colors.length] || 'GRAY'
  }));
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(helpMessage);
    process.exit(0);
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('Missing GITHUB_TOKEN environment variable.');
    console.error(helpMessage);
    process.exit(1);
  }

  const owner = args.owner;
  const title = args.title;
  if (!owner || !title) {
    console.error('Both --owner and --title must be provided.');
    console.error(helpMessage);
    process.exit(1);
  }

  const priorityList = args.priority
    ? args.priority.split(',').map((item) => item.trim()).filter(Boolean)
    : ['Critical', 'High', 'Medium', 'Low'];
  const areaList = args.areas
    ? args.areas.split(',').map((item) => item.trim()).filter(Boolean)
    : [...defaultAreaNames];
  const outputPath = args.output ? path.resolve(process.cwd(), args.output) : path.resolve(process.cwd(), 'project-automation.config.json');

  console.log(`Resolving owner '${owner}'...`);
  const { id: ownerId, type: ownerType } = await resolveOwnerId(token, owner);
  console.log(`Owner resolved as ${ownerType} (${ownerId}).`);

  console.log(`Creating project '${title}'...`);
  const project = await createProject(token, ownerId, title);
  console.log(`Project created: ${project.url}`);

  console.log('Creating Stage field...');
  const stageField = await createSingleSelectField(token, project.id, 'Stage', buildOptions([
    'Backlog',
    'Ready',
    'In Progress',
    'Blocked',
    'Review',
    'Done'
  ], ['GRAY', 'BLUE', 'YELLOW', 'RED', 'PURPLE', 'GREEN']));

  console.log('Creating Priority field...');
  const priorityField = await createSingleSelectField(token, project.id, 'Priority', buildOptions(priorityList, ['RED', 'ORANGE', 'YELLOW', 'BLUE', 'GRAY']));

  console.log('Creating Area field...');
  const areaField = await createSingleSelectField(token, project.id, 'Area', buildOptions(areaList, ['BLUE', 'GREEN', 'ORANGE', 'PURPLE']));

  console.log('Creating Owner field...');
  const ownerField = await createTextField(token, project.id, 'Owner');

  console.log('Creating Target Date field...');
  const targetDateField = await createDateField(token, project.id, 'Target Date');

  console.log('Creating Iteration field...');
  const iterationField = await createIterationField(token, project.id, 'Iteration');

  const config = {
    projectId: project.id,
    projectNumber: project.number,
    projectUrl: project.url,
    stageFieldId: stageField.id,
    stageOptionIds: stageField.options,
    priorityFieldId: priorityField.id,
    priorityOptionIds: priorityField.options,
    areaFieldId: areaField.id,
    areaOptionIds: areaField.options,
    ownerFieldId: ownerField.id,
    targetDateFieldId: targetDateField.id,
    iterationFieldId: iterationField.id
  };

  const stageLabelMappings = Object.fromEntries(
    Object.entries(defaultStageLabelMappings).filter(([, optionName]) => stageField.options?.[optionName])
  );
  if (Object.keys(stageLabelMappings).length > 0) {
    config.stageLabelMappings = stageLabelMappings;
  }

  const priorityLabelMappings = Object.fromEntries(
    Object.entries(defaultPriorityLabelMappings).filter(([, optionName]) => priorityField.options?.[optionName])
  );
  if (Object.keys(priorityLabelMappings).length > 0) {
    config.priorityLabelMappings = priorityLabelMappings;
  }

  const areaLabelMappings = Object.fromEntries(
    Object.entries(defaultAreaLabelMappings).filter(([, optionName]) => areaField.options?.[optionName])
  );
  if (Object.keys(areaLabelMappings).length > 0) {
    config.areaLabelMappings = areaLabelMappings;
  }

  const existing = await fs.readFile(outputPath, 'utf8').catch(() => null);
  if (existing) {
    await fs.writeFile(`${outputPath}.backup`, existing, 'utf8');
    console.log(`Existing config detected. Backup saved to ${outputPath}.backup`);
  }

  await fs.writeFile(outputPath, JSON.stringify(config, null, 2));
  console.log(`Automation config written to ${outputPath}.`);

  console.log('\nNext steps:');
  console.log('1. Commit the generated config file to your repository so automations can read it.');
  console.log('2. Create a repository secret named PROJECT_AUTOMATION_TOKEN with a fine-grained PAT that has Project and Issue read/write access.');
  console.log('3. Push the new workflow to trigger automatic syncing for future issue events.');
  console.log('\nHappy shipping!');
}

main().catch((error) => {
  console.error(`\nSetup failed: ${error.message}`);
  process.exit(1);
});
