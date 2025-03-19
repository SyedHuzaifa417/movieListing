import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

interface GetMoviesParams {
  userId?: string | null;
  search?: string;
  genre?: string;
  rating?: string;
}

interface CreateMovieParams {
  name: string;
  genre: string;
  rating: string;
  userId: string;
}

// User functions
export async function createUser(username: string, hashedPassword: string) {
  return prisma.user.create({
    data: {
      username,
      passwordHash: hashedPassword,
    },
  });
}

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: {
      username,
    },
  });
}

export async function getMovies({
  userId = null,
  search = "",
  genre = "",
  rating = "",
}: GetMoviesParams) {
  const where: any = {};

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (genre) {
    where.genre = {
      equals: genre,
      mode: "insensitive",
    };
  }

  if (rating) {
    where.rating = {
      equals: rating,
    };
  }

  if (userId) {
    where.userId = userId;
  }

  const movies = await prisma.movie.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  });

  return movies;
}

export async function createMovie({
  name,
  genre,
  rating,
  userId,
}: CreateMovieParams) {
  return prisma.movie.create({
    data: {
      name,
      genre,
      rating,
      userId,
    },
  });
}

export async function deleteMovie(id: string, userId: string) {
  const movie = await prisma.movie.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!movie) {
    throw new Error("Movie not found or not owned by user");
  }

  return prisma.movie.delete({
    where: {
      id,
    },
  });
}

export async function updateMovie(
  id: string,
  userId: string,
  data: { name?: string; genre?: string; rating?: string }
) {
  const movie = await prisma.movie.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!movie) {
    throw new Error("Movie not found or not owned by user");
  }

  return prisma.movie.update({
    where: { id },
    data: {
      name: data.name || movie.name,
      genre: data.genre || movie.genre,
      rating: data.rating || movie.rating,
    },
  });
}
