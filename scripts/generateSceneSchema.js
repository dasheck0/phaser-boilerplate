const fs = require('fs');
const path = require('path');
const ts = require('typescript');

function getAssetInterfaces() {
  const assetTypesFile = fs.readFileSync(path.join(__dirname, '../src/types/asset.type.ts'), 'utf8');
  const sourceFile = ts.createSourceFile('asset.type.ts', assetTypesFile, ts.ScriptTarget.Latest, true);

  let assetInterfaces = [];

  const visit = node => {
    if (ts.isInterfaceDeclaration(node)) {
      const heritageClauses = node.heritageClauses || [];

      for (const clause of heritageClauses) {
        if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
          const typeNames = clause.types.map(type => type.expression.getText());

          // If the interface extends 'Asset'
          if (typeNames.includes('Asset')) {
            // Capture the name and properties of the asset interface
            const assetInterface = {
              name: node.name.getText(),
              type: '',
              properties: {},
            };

            // Find the 'type' property and additional properties
            node.members.forEach(member => {
              if (ts.isPropertySignature(member) && member.name) {
                const propertyName = member.name.getText();
                const propertyType = member.type;

                // Capture the literal type value (like 'image', 'plugin', etc.)
                if (propertyName === 'type' && ts.isLiteralTypeNode(member.type)) {
                  const literal = member.type.literal;
                  if (ts.isStringLiteral(literal)) {
                    assetInterface.type = literal.text;
                  }
                } else {
                  // Capture other properties of the interface
                  if (propertyType) {
                    assetInterface.properties[propertyName] = convertTypeToJsonSchema(propertyType);
                  }
                }
              }
            });

            assetInterfaces.push(assetInterface);
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return assetInterfaces;
}

function getOptionsSchemaForType(optionsTypeName, visitedInterfaces = new Set()) {
  // Ensure visitedInterfaces is a Set
  if (!(visitedInterfaces instanceof Set)) {
    visitedInterfaces = new Set();
  }

  // Avoid processing the same interface multiple times
  if (visitedInterfaces.has(optionsTypeName)) return {};
  visitedInterfaces.add(optionsTypeName);

  // Fetch the relevant node from globalInterfaces
  const node = globalInterfaces.get(optionsTypeName);
  if (!node) return {};

  let optionsSchema = {};

  // Check for extended interfaces
  if (node.heritageClauses) {
    node.heritageClauses.forEach(clause => {
      if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
        clause.types.forEach(type => {
          const parentTypeName = type.expression.getText();

          // Avoid recursion if already visited
          if (!visitedInterfaces.has(parentTypeName)) {
            // Recursively get properties from the extended interfaces
            const parentSchema = getOptionsSchemaForType(parentTypeName, visitedInterfaces);
            optionsSchema = { ...optionsSchema, ...parentSchema.properties };
          }
        });
      }
    });
  }

  // Extract properties from the current interface
  node.members.forEach(member => {
    if (ts.isPropertySignature(member) && member.name) {
      const propertyName = member.name.getText();
      const propertyType = member.type;

      if (propertyType) {
        optionsSchema[propertyName] = convertTypeToJsonSchema(propertyType);
      }

      if (member.questionToken) {
        optionsSchema[propertyName].optional = true;
      }
    }
  });

  return {
    type: 'object',
    properties: optionsSchema,
    required: Object.keys(optionsSchema).filter(key => !optionsSchema[key].optional),
    additionalProperties: false,
  };
}

function getPrefabClasses() {
  const prefabs = [];

  globalClasses.forEach(node => {
    if (node.modifiers) {
      const decorator = node.modifiers.find(
        modifier =>
          ts.isDecorator(modifier) &&
          ts.isCallExpression(modifier.expression) &&
          modifier.expression.expression.getText() === 'RegisterPrefab',
      );

      if (decorator) {
        // Extract the prefab name from the decorator argument
        const prefabName = decorator.expression.arguments[0].text;

        // Extract constructor parameters
        const constructor = node.members.find(ts.isConstructorDeclaration);
        let optionsType = null;

        if (constructor) {
          // Find the last parameter, which is the options parameter
          const optionsParam = constructor.parameters[constructor.parameters.length - 1];

          // Get the type name of the options parameter
          optionsType = optionsParam.type.getText();
        }

        prefabs.push({
          name: prefabName,
          optionsType: optionsType,
        });
      }
    }
  });

  return prefabs;
}

function getPrefabOptionsSchema(prefabFiles) {
  const optionsSchemas = {};

  prefabFiles.forEach(({ file, dir }) => {
    const filePath = path.join(dir, file);
    const prefabs = getPrefabClasses(filePath);

    // Extract the options type for each prefab and convert to JSON schema
    prefabs.forEach(prefab => {
      const optionsType = prefab.optionsType;

      // Only add schema if it hasn't been added yet (to avoid duplicates)
      if (!optionsSchemas[prefab.name]) {
        optionsSchemas[prefab.name] = getOptionsSchemaForType(optionsType); // Removed unnecessary parameter
      }
    });
  });

  return optionsSchemas;
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if (file.endsWith('.ts')) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

const globalInterfaces = new Map();
const globalClasses = new Map();

function parseAllTypeScriptFiles() {
  const allFiles = getAllFiles(path.join(__dirname, '../src'));

  allFiles.forEach(filePath => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(path.basename(filePath), fileContent, ts.ScriptTarget.Latest, true);

    const visit = node => {
      // Collect interfaces
      if (ts.isInterfaceDeclaration(node)) {
        const interfaceName = node.name.getText();
        globalInterfaces.set(interfaceName, node);
      }

      // Collect classes
      if (ts.isClassDeclaration(node) && node.name) {
        const className = node.name.getText();
        globalClasses.set(className, node);
      }

      ts.forEachChild(node, visit);
    };

    ts.forEachChild(sourceFile, visit);
  });
}

function convertTypeToJsonSchema(typeNode) {
  // Handle union types (enums)
  if (ts.isUnionTypeNode(typeNode)) {
    const literalTypes = typeNode.types.filter(t => ts.isLiteralTypeNode(t));
    const stringLiterals = literalTypes
      .map(literalType => literalType.literal)
      .filter(literal => ts.isStringLiteral(literal))
      .map(literal => literal.text);

    // If all members are string literals, create an enum
    if (stringLiterals.length === literalTypes.length) {
      return { type: 'string', enum: stringLiterals };
    }
  }

  if (ts.isArrayTypeNode(typeNode)) {
    // Get the element type of the array
    const elementType = typeNode.elementType;
    return {
      type: 'array',
      items: convertTypeToJsonSchema(elementType),
    };
  }

  // Handle simple types
  switch (typeNode.getText()) {
    case 'string':
      return { type: 'string' };
    case 'number':
      return { type: 'number' };
    case 'boolean':
      return { type: 'boolean' };
    case 'Position':
    case 'Vector2':
      return {
        type: 'object',
        properties: {
          x: { type: 'number' },
          y: { type: 'number' },
        },
        required: ['x', 'y'],
      };
    default:
      return { type: 'object' };
  }
}

function generateSceneSchema() {
  parseAllTypeScriptFiles();

  const assetInterfaces = getAssetInterfaces();

  const prefabsDir = path.join(__dirname, '../src/prefabs');
  const uiDir = path.join(__dirname, '../src/ui');

  const prefabFiles = [
    ...fs
      .readdirSync(prefabsDir)
      .filter(file => file.endsWith('.prefab.ts'))
      .map(file => ({ file, dir: prefabsDir })),
    ...fs
      .readdirSync(uiDir)
      .filter(file => file.endsWith('.prefab.ts'))
      .map(file => ({ file, dir: uiDir })),
  ];

  const optionsSchemas = getPrefabOptionsSchema(prefabFiles);

  const assetSchemas = assetInterfaces.map(asset => ({
    if: { properties: { type: { const: asset.type } } },
    then: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        type: { type: 'string', enum: [asset.type] },
        url: { type: 'string' },
        ...asset.properties,
      },
      required: ['name', 'type', 'url', ...Object.keys(asset.properties)],
      additionalProperties: false
    },
  }));

  const prefabSchemas = Object.keys(optionsSchemas).map(key => ({
    type: 'object',
    allOf: [
      {
        properties: {
          type: { const: key },
        },
      },
      optionsSchemas[key],
    ],
  }));

  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      groups: {
        type: 'array',
        items: { type: 'string' }
      },
      scenes: {
        type: 'array',
        items: { type: 'string' }
      },
      assets: {
        type: 'array',
        items: {
          type: 'object',
          allOf: assetSchemas,
        }
      },
      prefabs: {
        type: 'object',
        patternProperties: {
          '^.*$': {
            type: 'object',
            properties: {
              options: {
                oneOf: prefabSchemas,
              },
            },
            additionalProperties: false,
          },
        },
      },
    },
    required: ['groups', 'scenes', 'assets', 'prefabs'],
  };

  fs.writeFileSync(path.join(__dirname, '../schemas/scene.schema.json'), JSON.stringify(schema, null, 2));
  console.log('Scene schema generated successfully.');
}

generateSceneSchema();
