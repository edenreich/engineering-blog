---
title: 'Design-First Approach with OpenAPI'
date: 'May 12 2024'
thumbnail: 'openapi.png'
tags: 'openapi, api, sdl'
excerpt: 'Explore why a shift from code annotations to plain OpenAPI Specification (OAS) enhances API design and development processes.'
draft: false
---

In the dynamic world of software development, where methodologies and tools are continually evolving to improve efficiency, maintainability, and scalability, the OpenAPI Specification (OAS) stands out as a critical standard for designing and documenting RESTful APIs. Traditionally, developers have implemented APIs using code-first approaches, often embedding Swagger annotations directly into their codebases. However, there is a growing trend towards adopting a design-first methodology, where APIs are meticulously designed using plain OpenAPI Specification files prior to any coding. This article delves into the rationale behind this shift, emphasizing the myriad benefits of using plain OAS to generate both code and documentation over the traditional method of embedding Swagger annotations in the code.

Let's look on an example, let's say I've built a router in Go and I want to generate out of my code the docs, this code might looks like this:

```golang
// ShowAccount godoc
// @Summary      Show an account
// @Description  get string by ID
// @Tags         accounts
// @Accept       json
// @Produce      json
// @Param        id   path      int  true  "Account ID"
// @Success      200  {object}  model.Account
// @Failure      400  {object}  httputil.HTTPError
// @Failure      404  {object}  httputil.HTTPError
// @Failure      500  {object}  httputil.HTTPError
// @Router       /accounts/{id} [get]
func (c *Controller) ShowAccount(ctx *gin.Context) {
  id := ctx.Param("id")
  aid, err := strconv.Atoi(id)
  if err != nil {
    httputil.NewError(ctx, http.StatusBadRequest, err)
    return
  }
  account, err := model.AccountOne(aid)
  if err != nil {
    httputil.NewError(ctx, http.StatusNotFound, err)
    return
  }
  ctx.JSON(http.StatusOK, account)
}

```

While it looks like a very flexible approach, it is absolutely not! Let me explain why:

- It assumes everyone on your team is a Go developer. This can be exclusionary and limit the participation of team members who might excel in other areas but are not proficient in Go. It effectively creates a barrier to entry for contributing to the API's design and documentation.

- Often, libraries that enable you to write annotations support older versions of the OpenAPI Specification, which means your code may not benefit from the latest features introduced in OpenAPI until the library maintainers update it to include these enhancements.

- It reduces drastically the possibility of parallel work (i.e frontend team / backend team). When documentation and endpoint details are embedded directly within the code, frontend developers must wait for backend updates before they can proceed with their integration tasks. This serialized workflow hinders rapid development and testing.

- It increases the risk of documentation drift. Every change in the code needs a corresponding update in the annotations. If these updates are not meticulously managed, the documentation can easily become outdated, misleading, or incorrect, which defeats the purpose of having API documentation in the first place.

- It complicates the codebase. Embedding API specifications within code annotations clutters the codebase, making it harder to read and maintain. This additional complexity can slow down new developers trying to understand the system and increase the likelihood of errors.

- It limits the use of design-first tools and practices. By embedding the API design within the code, you lose out on many of the benefits of a design-first approach, such as the ability to use mock servers and automatic validation tools that can leverage a standalone API specification document.

Taking these factors into account, it's clear that while annotating code directly for Swagger documentation might seem convenient at first, it becomes very quickly with significant drawbacks that can hinder a team's effectiveness and the overall quality of the API.

Instead, what you could write is a standard [OpenAPI Spec](https://swagger.io/specification/), that describes this endpoint:

```yaml
openapi: 3.0.0
info:
  title: Example API
  version: 1.0.0
paths:
  /accounts/{id}:
    get:
      summary: Show an account
      description: get string by ID
      tags:
        - accounts
      parameters:
        - in: path
          name: id
          schema:
            type: integer
          required: true
          description: Account ID
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Account'
        '400':
          description: Bad request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HTTPError'
        '404':
          description: Not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HTTPError'
        '500':
          description: Internal server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HTTPError'
components:
  schemas:
    Account:
      type: object
      properties:
        # Define the properties of Account model according to your application's requirements
    HTTPError:
      type: object
      properties:
        message:
          type: string
        code:
          type: integer
```

Using this YAML-based approach, the document serves as the universal source of truth, accessible to any engineer within your company. This clarity ensures that team members can readily understand and interact with the API, regardless of their specific role or expertise. Additionally, this standardized document allows for the generation of codebases in various programming languages, offering flexibility rather than constraining developers to a single technology stack.

Consider this YAML document as a universal interface guides not only the API’s functionality but also facilitates the automated creation of documentation, codebases, and SDKs. The simplicity and comprehensibility of the YAML format make it an indispensable tool that supports a wide range of development activities, enhancing both productivity and collaboration across diverse teams.

## Enhanced API Design Consistency and Clarity

One of the most compelling arguments for using plain OAS files is the consistency and clarity it brings to API design. With a design-first approach, the entire API contract is defined upfront in an OAS document. This centralized API specification ensures all stakeholders, including developers, product managers, and external partners, have a clear and consistent understanding of the API’s capabilities and constraints before any development begins.

Conversely, when Swagger annotations are used in the code, the API documentation and design can become fragmented and inconsistent. Annotations spread across multiple code files can lead to discrepancies and make it difficult for new team members to grasp the overall API architecture.

## Streamlined Collaboration Across Teams

A design-first approach using OAS facilitates better collaboration across different teams. Non-developers, such as product managers and design teams, can easily contribute to the API’s design discussions and review processes without needing to understand the codebase. This inclusivity in the design process can enhance the API's usability and ensure it more effectively meets user needs and business objectives.

In the code-first approach, non-technical stakeholders may find it challenging to participate actively in the API development process due to the technical barrier that code presents. This can lead to miscommunications and a final product that may not fully align with business or user requirements.

## Improved API Lifecycle Management

Managing the lifecycle of an API from design to deprecation is more straightforward with a design-first approach. Changes to the API are made directly in the OAS file, which can then be used to automatically generate code stubs and documentation. This method ensures that documentation is always up-to-date and aligned with the actual API implementation.

Using Swagger annotations, changes in the API require manual updates to both the code and the associated documentation. This process is error-prone and can lead to outdated or incorrect documentation if not meticulously maintained.

## Faster Iteration and Prototyping

Developing APIs from an OAS document allows for rapid prototyping. Tools that parse OAS can generate mock servers and API stubs in various programming languages, enabling frontend teams to start working with the API even before backend implementation begins. This parallel development process can significantly reduce the time to market for new features.

Conversely, the code-first approach with Swagger requires the backend API to be at least partially implemented before any real interaction can occur, slowing down the initial phases of development.

## Reduction in Code Clutter and Complexity

Maintaining a codebase with extensive Swagger annotations can lead to clutter and increased complexity. As APIs evolve, the volume of annotations can become cumbersome, making the code harder to read and maintain.

By keeping the API specification in a separate OAS file, the codebase remains clean and focused solely on functionality, reducing complexity and enhancing maintainability.

## Extensibility

Furthermore, should you wish to enhance the generator in the future to produce outputs beyond just documentation and codebases, you can achieve this by incorporating custom attributes. This is done in a declarative YAML format using the `x-` prefix, allowing for flexible and scalable extensions tailored to your evolving needs. You don't need to depend on the features of the annotation library.

## Conclusion

While the code-first approach using Swagger annotations has been popular, the shift towards a design-first methodology using plain OAS files offers substantial benefits. These include improved design clarity, enhanced collaboration, easier API lifecycle management, faster iteration cycles, and cleaner codebases. As the industry continues to recognize these advantages, the move towards designing APIs with OAS before coding is likely to become a standard practice, fostering more efficient and effective API development processes.
