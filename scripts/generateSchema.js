const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const [filename, interfaceName] = process.argv.slice(2);

if (!filename || !interfaceName) {
  console.error('Missing arguments');
  process.exit(1);
}

const filePath = path.join(__dirname, '..', filename);
const JSONSchemaFileName = `${interfaceName}.schema.json`;
const schemaPath = path.join(__dirname, '..', 'schemas/prefabs');

exec(
  `typescript-json-schema "${filePath}" "${interfaceName}" --required --titles=true --esModuleInterop=true --noExtraProps --out "${schemaPath}/${JSONSchemaFileName}"`,
  (error, stdout, stderr) => {
    if (error) {
      console.error(error);
      process.exit(1);
    }

    if (stderr) {
      console.error(stderr);
      process.exit(1);
    }

    const prefabSchema = JSON.parse(fs.readFileSync(`${schemaPath}/${JSONSchemaFileName}`, 'utf8'));
    prefabSchema.properties.type.enum = [interfaceName.replace('Options', '')];
    fs.writeFileSync(`${schemaPath}/${JSONSchemaFileName}`, JSON.stringify(prefabSchema, null, 2));

    const sceneSchema = JSON.parse(fs.readFileSync(`${schemaPath}/../scene.schema.json`, 'utf8'));
    const allSchemas = fs.readdirSync(schemaPath).filter(file => file.endsWith('.json'));

    sceneSchema.properties.prefabs.additionalProperties.properties.options.oneOf = allSchemas.map(schema => ({
      $ref: `./prefabs/${schema}`,
    }));

    fs.writeFileSync(`${schemaPath}/../scene.schema.json`, JSON.stringify(sceneSchema, null, 2));
  },
);
