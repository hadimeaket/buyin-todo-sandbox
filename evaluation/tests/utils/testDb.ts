let mongoServer: any | undefined;
let mongooseMod: any | undefined;

export async function connectDB(): Promise<void> {
  if (mongoServer) return;

  let MongoMemoryServerCtor: any;
  try {
    mongooseMod = require("mongoose");
    ({
      MongoMemoryServer: MongoMemoryServerCtor,
    } = require("mongodb-memory-server"));
  } catch {
    // Branch does not use mongo/mongoose.
    return;
  }

  mongoServer = await MongoMemoryServerCtor.create();
  const uri: string = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  process.env.NODE_ENV = "test";

  // Some implementations connect on import; this ensures mongoose can connect if it hasn't.
  if (mongooseMod.connection?.readyState === 0) {
    await mongooseMod.connect(uri);
  }
}

export async function clearDB(): Promise<void> {
  if (!mongooseMod) {
    try {
      mongooseMod = require("mongoose");
    } catch {
      return;
    }
  }

  if (!mongooseMod?.connection?.collections) return;
  const { collections } = mongooseMod.connection;
  await Promise.all(
    Object.values(collections).map((c: any) => c.deleteMany({}))
  );
}

export async function closeDB(): Promise<void> {
  try {
    if (mongooseMod && mongooseMod.connection?.readyState !== 0) {
      await mongooseMod.disconnect();
    }
  } finally {
    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = undefined;
    }
    mongooseMod = undefined;
  }
}
