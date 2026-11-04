function errorResponse(description) {
  return {
    description,

    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/ErrorResponse",
        },
      },
    },
  };
}

function jsonBody(schemaRef) {
  return {
    required: true,

    content: {
      "application/json": {
        schema: {
          $ref: schemaRef,
        },
      },
    },
  };
}

const idParameter = {
  name: "id",
  in: "path",
  required: true,

  schema: {
    type: "integer",
    minimum: 1,
  },
};

module.exports = {
  openapi: "3.0.3",

  info: {
    title: "Room Booking API",
    version: "1.0.0",
    description: "API for managing buildings, rooms and reservations.",
  },

  servers: [
    {
      url: "/",
    },
  ],

  security: [
    {
      bearerAuth: [],
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },

    schemas: {
      ErrorResponse: {
        type: "object",

        required: ["error"],

        properties: {
          error: {
            type: "object",

            required: ["code", "message", "requestId"],

            properties: {
              code: {
                type: "string",
                example: "VALIDATION_ERROR",
              },

              message: {
                type: "string",
                example: "Validation failed",
              },

              details: {
                type: "array",

                items: {
                  type: "object",
                  additionalProperties: true,
                },
              },

              requestId: {
                type: "string",
                example: "599b4bb0-e6e2-4ef9-b612-03d04081e1f6",
              },
            },
          },
        },
      },

      User: {
        type: "object",

        required: ["id", "email", "role", "createdAt"],

        properties: {
          id: {
            type: "integer",
            example: 2,
          },

          email: {
            type: "string",
            format: "email",
            example: "jan.kowalski@example.com",
          },

          role: {
            type: "string",
            enum: ["USER", "ADMIN"],
          },

          createdAt: {
            type: "string",
            format: "date-time",
          },
        },
      },

      RegisterBody: {
        type: "object",

        required: ["email", "password"],

        additionalProperties: false,

        properties: {
          email: {
            type: "string",
            format: "email",
            example: "user@example.com",
          },

          password: {
            type: "string",
            minLength: 10,
            maxLength: 72,
            example: "bardzo-dlugie-haslo",
          },
        },
      },

      LoginBody: {
        type: "object",

        required: ["email", "password"],

        additionalProperties: false,

        properties: {
          email: {
            type: "string",
            format: "email",
            example: "admin@example.com",
          },

          password: {
            type: "string",
            example: "admin-password-123",
          },
        },
      },

      LoginResponse: {
        type: "object",

        required: ["accessToken", "tokenType", "expiresIn"],

        properties: {
          accessToken: {
            type: "string",
          },

          tokenType: {
            type: "string",
            example: "Bearer",
          },

          expiresIn: {
            type: "string",
            example: "15m",
          },
        },
      },

      Building: {
        type: "object",

        required: ["id", "name", "address"],

        properties: {
          id: {
            type: "integer",
            example: 1,
          },

          name: {
            type: "string",
            example: "Budynek A",
          },

          address: {
            type: "string",
            example: "ul. Warszawska 24, Kraków",
          },

          roomsCount: {
            type: "integer",
            example: 3,
          },
        },
      },

      CreateBuildingBody: {
        type: "object",

        required: ["name", "address"],

        additionalProperties: false,

        properties: {
          name: {
            type: "string",
            example: "Budynek C",
          },

          address: {
            type: "string",
            example: "ul. Testowa 1, Kraków",
          },
        },
      },

      Room: {
        type: "object",

        required: ["id", "name", "capacity"],

        properties: {
          id: {
            type: "integer",
            example: 1,
          },

          buildingId: {
            type: "integer",
            example: 1,
          },

          name: {
            type: "string",
            example: "101",
          },

          capacity: {
            type: "integer",
            example: 30,
          },

          building: {
            type: "object",

            properties: {
              id: {
                type: "integer",
              },

              name: {
                type: "string",
              },
            },
          },
        },
      },

      CreateRoomBody: {
        type: "object",

        required: ["buildingId", "name", "capacity"],

        additionalProperties: false,

        properties: {
          buildingId: {
            type: "integer",
            minimum: 1,
            example: 1,
          },

          name: {
            type: "string",
            example: "301",
          },

          capacity: {
            type: "integer",
            minimum: 1,
            example: 40,
          },
        },
      },

      ReservationUser: {
        type: "object",

        required: ["id", "email"],

        properties: {
          id: {
            type: "integer",
            example: 2,
          },

          email: {
            type: "string",
            format: "email",
            example: "jan.kowalski@example.com",
          },
        },
      },

      Reservation: {
        type: "object",

        required: [
          "id",
          "roomId",
          "user",
          "participants",
          "startTime",
          "endTime",
          "status",
          "createdAt",
        ],

        properties: {
          id: {
            type: "integer",
          },

          roomId: {
            type: "integer",
          },

          user: {
            $ref: "#/components/schemas/ReservationUser",
          },

          participants: {
            type: "integer",
          },

          startTime: {
            type: "string",
            format: "date-time",
          },

          endTime: {
            type: "string",
            format: "date-time",
          },

          status: {
            type: "string",
            enum: ["CONFIRMED", "CANCELLED"],
          },

          createdAt: {
            type: "string",
            format: "date-time",
          },

          cancelledAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
        },
      },

      DetailedReservation: {
        type: "object",

        required: [
          "id",
          "room",
          "user",
          "participants",
          "startTime",
          "endTime",
          "status",
          "createdAt",
        ],

        properties: {
          id: {
            type: "integer",
          },

          room: {
            type: "object",

            properties: {
              id: {
                type: "integer",
              },

              name: {
                type: "string",
              },

              building: {
                type: "object",

                properties: {
                  id: {
                    type: "integer",
                  },

                  name: {
                    type: "string",
                  },
                },
              },
            },
          },

          user: {
            $ref: "#/components/schemas/ReservationUser",
          },

          participants: {
            type: "integer",
          },

          startTime: {
            type: "string",
            format: "date-time",
          },

          endTime: {
            type: "string",
            format: "date-time",
          },

          status: {
            type: "string",
            enum: ["CONFIRMED", "CANCELLED"],
          },

          createdAt: {
            type: "string",
            format: "date-time",
          },

          cancelledAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
        },
      },

      CreateReservationBody: {
        type: "object",

        required: ["roomId", "participants", "startTime", "endTime"],

        additionalProperties: false,

        properties: {
          roomId: {
            type: "integer",
            minimum: 1,
            example: 1,
          },

          participants: {
            type: "integer",
            minimum: 1,
            example: 10,
          },

          startTime: {
            type: "string",
            format: "date-time",
            example: "2026-12-10T10:00:00.000Z",
          },

          endTime: {
            type: "string",
            format: "date-time",
            example: "2026-12-10T12:00:00.000Z",
          },
        },
      },

      PaginationMeta: {
        type: "object",

        properties: {
          page: {
            type: "integer",
          },

          limit: {
            type: "integer",
          },

          total: {
            type: "integer",
          },

          totalPages: {
            type: "integer",
          },
        },
      },
    },
  },

  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register user",
        security: [],

        requestBody: jsonBody("#/components/schemas/RegisterBody"),

        responses: {
          201: {
            description: "User registered",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },

          400: errorResponse("Validation error"),

          409: errorResponse("Email already registered"),
        },
      },
    },

    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in",
        security: [],

        requestBody: jsonBody("#/components/schemas/LoginBody"),

        responses: {
          200: {
            description: "Login successful",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LoginResponse",
                },
              },
            },
          },

          400: errorResponse("Validation error"),

          401: errorResponse("Invalid email or password"),
        },
      },
    },

    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user",

        responses: {
          200: {
            description: "Current user",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },

          401: errorResponse("Authentication required"),

          404: errorResponse("User not found"),
        },
      },
    },

    "/api/buildings": {
      get: {
        tags: ["Buildings"],
        summary: "Get all buildings",

        responses: {
          200: {
            description: "List of buildings",

            content: {
              "application/json": {
                schema: {
                  type: "array",

                  items: {
                    $ref: "#/components/schemas/Building",
                  },
                },
              },
            },
          },

          401: errorResponse("Authentication required"),
        },
      },

      post: {
        tags: ["Buildings"],
        summary: "Create building - ADMIN only",

        requestBody: jsonBody("#/components/schemas/CreateBuildingBody"),

        responses: {
          201: {
            description: "Building created",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Building",
                },
              },
            },
          },

          400: errorResponse("Validation error"),

          401: errorResponse("Authentication required"),

          403: errorResponse("Insufficient permissions"),

          409: errorResponse("Building already exists"),
        },
      },
    },

    "/api/buildings/{id}": {
      get: {
        tags: ["Buildings"],
        summary: "Get building by id",

        parameters: [idParameter],

        responses: {
          200: {
            description: "Building",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Building",
                },
              },
            },
          },

          400: errorResponse("Invalid id"),

          401: errorResponse("Authentication required"),

          404: errorResponse("Building not found"),
        },
      },
    },

    "/api/buildings/{id}/rooms": {
      get: {
        tags: ["Buildings"],
        summary: "Get rooms in building",

        parameters: [idParameter],

        responses: {
          200: {
            description: "Rooms in building",

            content: {
              "application/json": {
                schema: {
                  type: "array",

                  items: {
                    $ref: "#/components/schemas/Room",
                  },
                },
              },
            },
          },

          400: errorResponse("Invalid id"),

          401: errorResponse("Authentication required"),

          404: errorResponse("Building not found"),
        },
      },
    },

    "/api/rooms": {
      get: {
        tags: ["Rooms"],
        summary: "Get all rooms",

        responses: {
          200: {
            description: "List of rooms",

            content: {
              "application/json": {
                schema: {
                  type: "array",

                  items: {
                    $ref: "#/components/schemas/Room",
                  },
                },
              },
            },
          },

          401: errorResponse("Authentication required"),
        },
      },

      post: {
        tags: ["Rooms"],
        summary: "Create room - ADMIN only",

        requestBody: jsonBody("#/components/schemas/CreateRoomBody"),

        responses: {
          201: {
            description: "Room created",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Room",
                },
              },
            },
          },

          400: errorResponse("Validation error"),

          401: errorResponse("Authentication required"),

          403: errorResponse("Insufficient permissions"),

          404: errorResponse("Building not found"),

          409: errorResponse("Room already exists"),
        },
      },
    },

    "/api/rooms/{id}": {
      get: {
        tags: ["Rooms"],
        summary: "Get room by id",

        parameters: [idParameter],

        responses: {
          200: {
            description: "Room",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Room",
                },
              },
            },
          },

          400: errorResponse("Invalid id"),

          401: errorResponse("Authentication required"),

          404: errorResponse("Room not found"),
        },
      },
    },

    "/api/reservations": {
      get: {
        tags: ["Reservations"],
        summary: "Get reservations",

        parameters: [
          {
            name: "roomId",
            in: "query",

            schema: {
              type: "integer",
              minimum: 1,
            },
          },

          {
            name: "buildingId",
            in: "query",

            schema: {
              type: "integer",
              minimum: 1,
            },
          },

          {
            name: "userId",
            in: "query",
            description: "Available only for ADMIN",

            schema: {
              type: "integer",
              minimum: 1,
            },
          },

          {
            name: "status",
            in: "query",

            schema: {
              type: "string",

              enum: ["CONFIRMED", "CANCELLED"],
            },
          },

          {
            name: "from",
            in: "query",

            schema: {
              type: "string",
              format: "date-time",
            },
          },

          {
            name: "to",
            in: "query",

            schema: {
              type: "string",
              format: "date-time",
            },
          },

          {
            name: "page",
            in: "query",

            schema: {
              type: "integer",
              minimum: 1,
              default: 1,
            },
          },

          {
            name: "limit",
            in: "query",

            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 20,
            },
          },

          {
            name: "sort",
            in: "query",

            schema: {
              type: "string",

              enum: [
                "startTime",
                "-startTime",
                "createdAt",
                "-createdAt",
                "participants",
                "-participants",
              ],

              default: "startTime",
            },
          },
        ],

        responses: {
          200: {
            description: "Reservations",

            content: {
              "application/json": {
                schema: {
                  type: "object",

                  properties: {
                    data: {
                      type: "array",

                      items: {
                        $ref: "#/components/schemas/DetailedReservation",
                      },
                    },

                    meta: {
                      $ref: "#/components/schemas/PaginationMeta",
                    },
                  },
                },
              },
            },
          },

          400: errorResponse("Invalid query parameters"),

          401: errorResponse("Authentication required"),

          403: errorResponse("USER cannot filter by userId"),
        },
      },

      post: {
        tags: ["Reservations"],
        summary: "Create reservation",

        requestBody: jsonBody("#/components/schemas/CreateReservationBody"),

        responses: {
          201: {
            description: "Reservation created",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Reservation",
                },
              },
            },
          },

          400: errorResponse("Validation error"),

          401: errorResponse("Authentication required"),

          404: errorResponse("Room not found"),

          409: errorResponse("Capacity exceeded or room already booked"),
        },
      },
    },

    "/api/reservations/{id}": {
      get: {
        tags: ["Reservations"],
        summary: "Get reservation by id",

        parameters: [idParameter],

        responses: {
          200: {
            description: "Reservation",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DetailedReservation",
                },
              },
            },
          },

          400: errorResponse("Invalid id"),

          401: errorResponse("Authentication required"),

          404: errorResponse("Reservation not found or not accessible"),
        },
      },
    },

    "/api/reservations/{id}/cancel": {
      patch: {
        tags: ["Reservations"],
        summary: "Cancel reservation",

        parameters: [idParameter],

        responses: {
          200: {
            description: "Reservation cancelled",

            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Reservation",
                },
              },
            },
          },

          400: errorResponse("Invalid id"),

          401: errorResponse("Authentication required"),

          404: errorResponse("Reservation not found or not accessible"),

          409: errorResponse(
            "Reservation already started or invalid transition",
          ),
        },
      },
    },
  },
};
